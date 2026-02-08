import { useEffect, useState } from 'react';
import { leadRepository } from '../services/leadRepository';
import { Lead } from '../types';
import {
    UserGroupIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
    // State for dashboard metrics
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState({
        activeCount: 0,
        contactedCount: 0,
        upcomingCount: 0,
        bookedCount: 0,
        totalCount: 0,
        monthlyGrowth: [] as { created_at: string }[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await leadRepository.fetchDashboardMetrics();
                setRecentLeads(data.recentLeads);
                setStats({
                    activeCount: data.activeCount,
                    contactedCount: data.activeContactedCount,
                    upcomingCount: data.upcomingCount,
                    bookedCount: data.bookedCount,
                    totalCount: data.totalCount,
                    monthlyGrowth: data.monthlyGrowth
                });
            } catch (e) {
                console.error("Failed to load dashboard metrics", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // --- METRICS CALCULATIONS ---
    const activeLeads = stats.activeCount;
    const upcomingWeddings = stats.upcomingCount;

    // Simplified revenue calc: If booked, assume $15k base + catering estimate (placeholder logic or 0)
    // For now, consistent with screenshot, default to 0 if no explicit 'booked_value' field exists.
    // Simplified revenue calc: If booked, assume $15k base + catering estimate (placeholder logic or 0)
    // For now, consistent with screenshot, default to 0 if no explicit 'booked_value' field exists.
    // const bookedRevenue = 0; // Removed as unused
    const contactedCount = stats.contactedCount;

    const conversionRate = stats.totalCount > 0 ? Math.round((stats.bookedCount / stats.totalCount) * 100) : 0;

    // --- CHART DATA PREPARATION ---
    // Group by Month (last 6 months)
    const getMonthData = () => {
        const months: Record<string, number> = {};
        const today = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }

        // Fill data
        stats.monthlyGrowth.forEach(item => {
            if (item.created_at) {
                const date = new Date(item.created_at);
                const key = date.toLocaleString('default', { month: 'short' });
                if (months[key] !== undefined) {
                    months[key]++;
                }
            }
        });

        return Object.entries(months).map(([name, count]) => ({ name, count }));
    };

    const chartData = getMonthData();

    // --- RECENT ACTIVITY ---
    const recentActivity = recentLeads.map(lead => ({
        id: lead.id,
        action: `New lead captured: ${lead.partner1_first_name || 'Unknown Client'}`,
        date: lead.created_at ? new Date(lead.created_at).toLocaleString() : 'Just now'
    }));

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-primary">Welcome back, Planner</h1>
                <p className="mt-2 text-xl text-secondary">Here's what's happening with your weddings today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1 */}
                <div className="bg-white overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-900/5 px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <dt className="truncate text-sm font-medium text-gray-500">Total Active Leads</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{activeLeads}</dd>
                        </div>
                        <div className="h-12 w-12 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-gray-500">
                            <span className="text-gray-400">Real-time</span> vs last month
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-900/5 px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <dt className="truncate text-sm font-medium text-gray-500">Upcoming Weddings</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{upcomingWeddings}</dd>
                        </div>
                        <div className="h-12 w-12 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
                            <CalendarIcon className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-gray-500">
                            <span className="text-gray-900 font-medium">This Month</span> vs last month
                        </div>
                    </div>
                </div>

                {/* Card 3 - Replaced Revenue with Contacted  */}
                <div className="bg-white overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-900/5 px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <dt className="truncate text-sm font-medium text-gray-500">Already Contacted</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{contactedCount}</dd>
                        </div>
                        <div className="h-12 w-12 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
                            <ChatBubbleLeftRightIcon className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-gray-500">
                            <span className="text-gray-900 font-medium">Outreach</span> vs new leads
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-900/5 px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <dt className="truncate text-sm font-medium text-gray-500">Conversion Rate</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{conversionRate}%</dd>
                        </div>
                        <div className="h-12 w-12 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
                            <ArrowTrendingUpIcon className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-gray-500">
                            <span className="text-green-600 font-medium">Leads to Booked</span> vs last month
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Activity Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Chart */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Lead Acquisition</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Activity */}
                <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Recent Activity</h3>
                    <ul role="list" className="space-y-6">
                        {recentActivity.length === 0 && <p className="text-gray-500 text-sm">No activity yet.</p>}
                        {recentActivity.map((item) => (
                            <li key={item.id} className="relative flex gap-x-4">
                                <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                                    <div className="w-px bg-gray-200"></div>
                                </div>
                                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 ring-1 ring-gray-300"></div>
                                </div>
                                <div className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                                    <span className="font-medium text-gray-900 block">{item.action}</span>
                                    <time dateTime={item.date}>{item.date}</time>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Advice Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">💡 How to Improve Conversion</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2">Speed Matters</h4>
                        <p className="text-sm text-blue-800">
                            Respond to new leads within <strong>5 minutes</strong>. Vendors who reply quickly are 7x more likely to qualify the lead.
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h4 className="font-semibold text-purple-900 mb-2">Personalize Your email</h4>
                        <p className="text-sm text-purple-800">
                            Don't just send a price list. Ask a question about their vision (e.g., "Have you visited Puerto Vallarta before?") to start a conversation.
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-green-900 mb-2">Follow Up</h4>
                        <p className="text-sm text-green-800">
                            80% of sales happen after the 5th follow-up. Use the CRM to track and schedule your follow-ups until you get a "Yes" or "No".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
