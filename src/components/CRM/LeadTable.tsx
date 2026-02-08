import { Lead, LeadStatus } from '../../types';
import { PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Using 24/outline
import { useNavigate } from 'react-router-dom';

interface LeadTableProps {
    leads: Lead[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onNextPage: () => void;
    onPrevPage: () => void;
    onPageSizeChange: (size: number) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: LeadStatus) => void;
    onEmailClick: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
    [LeadStatus.NEW_LEAD]: 'bg-[#3B82F6]/10 text-[#3B82F6] ring-1 ring-inset ring-[#3B82F6]/20', // Blue #3B82F6
    'New': 'bg-[#3B82F6]/10 text-[#3B82F6] ring-1 ring-inset ring-[#3B82F6]/20', // Legacy "New" -> Blue
    [LeadStatus.CONTACTED]: 'bg-[#06B6D4]/10 text-[#06B6D4] ring-1 ring-inset ring-[#06B6D4]/20', // Cyan #06B6D4
    [LeadStatus.ENGAGED]: 'bg-[#8B5CF6]/10 text-[#8B5CF6] ring-1 ring-inset ring-[#8B5CF6]/20', // Purple #8B5CF6
    [LeadStatus.QUALIFIED]: 'bg-[#10B981]/10 text-[#10B981] ring-1 ring-inset ring-[#10B981]/20', // Teal #10B981
    [LeadStatus.PROPOSAL_SENT]: 'bg-[#F59E0B]/10 text-[#F59E0B] ring-1 ring-inset ring-[#F59E0B]/20', // Amber #F59E0B
    [LeadStatus.NEGOTIATION]: 'bg-[#F97316]/10 text-[#F97316] ring-1 ring-inset ring-[#F97316]/20', // Orange #F97316
    [LeadStatus.WON]: 'bg-[#22C55E]/10 text-[#22C55E] ring-1 ring-inset ring-[#22C55E]/20', // Green #22C55E
    [LeadStatus.LOST]: 'bg-[#EF4444]/10 text-[#EF4444] ring-1 ring-inset ring-[#EF4444]/20', // Red #EF4444
};

export default function LeadTable({
    leads,
    totalCount,
    currentPage,
    pageSize,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
    onPageSizeChange,
    onDelete,
    onStatusChange,
    onEmailClick
}: LeadTableProps) {
    const navigate = useNavigate();

    // Pagination Controls Component
    const PaginationControls = () => {
        const start = ((currentPage - 1) * pageSize) + 1;
        const end = Math.min(start + leads.length - 1, totalCount); // Use leads.length to be accurate if last page has fewer items
        const isZero = totalCount === 0;

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={onPrevPage}
                        disabled={!hasPrevPage}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!hasPrevPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNextPage}
                        disabled={!hasNextPage}
                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{isZero ? 0 : start}</span> to <span className="font-medium">{isZero ? 0 : end}</span> of <span className="font-medium">{totalCount}</span> results
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={onPrevPage}
                                disabled={!hasPrevPage}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasPrevPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                onClick={onNextPage}
                                disabled={!hasNextPage}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    if (leads.length === 0 && totalCount === 0) {
        // Keep controls visible even if empty, or just show a message. 
        // Requirement says "Default display: 50 leads". If empty, we should probably still show the table structure or a nice empty state.
        // But keeping the header is better context.
    }

    return (
        <div className="flex flex-col">
            <PaginationControls />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wedding Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No leads found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-0">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {lead.partner1_first_name} {lead.partner1_last_name}
                                                    {lead.partner2_first_name && ` & ${lead.partner2_first_name} ${lead.partner2_last_name}`}
                                                </div>
                                                <button
                                                    onClick={() => onEmailClick(lead)}
                                                    className="text-sm text-primary hover:text-pink-700 hover:underline text-left block"
                                                    title="Send Email"
                                                >
                                                    {lead.email}
                                                </button>
                                                {/* Partner Badges (Simplified) */}
                                                <div className="mt-1 flex gap-1">
                                                    {lead.partner1_first_name && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">P1: {lead.partner1_first_name}</span>}
                                                    {lead.partner2_first_name && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">P2: {lead.partner2_first_name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => onStatusChange(lead.id!, e.target.value as LeadStatus)}
                                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${statusColors[lead.status as LeadStatus] || 'bg-gray-100'}`}
                                        >
                                            {Object.values(LeadStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {lead.wedding_date || 'TBD'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {lead.budget_range || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/crm/${lead.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => onDelete(lead.id!)} className="text-red-600 hover:text-red-900">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <PaginationControls />
        </div>
    );
}
