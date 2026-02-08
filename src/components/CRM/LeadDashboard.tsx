import { useEffect, useState, useCallback } from 'react';
import { leadRepository } from '../../services/leadRepository';
import { Lead, LeadStatus } from '../../types';
import LeadTable from './LeadTable';
import LeadFormModal from './LeadFormModal';
import SmartParserModal from './SmartParserModal';
import { MagnifyingGlassIcon, PlusIcon, BoltIcon, ArrowPathIcon, EnvelopeIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { templateRepository, EmailTemplate } from '../../services/templateRepository';

const DEFAULT_PAGE_SIZE = 50;

export default function LeadDashboard() {
    // Data State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filters & Pagination State
    const [filterText, setFilterText] = useState('');
    const [debouncedFilterText, setDebouncedFilterText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Pagination: Stack of cursors. Index 0 = Page 2 start cursor. Empty = Page 1.
    const [cursors, setCursors] = useState<string[]>([]);
    const [currentNextCursor, setCurrentNextCursor] = useState<string | null>(null);

    // Persisted Page Size
    const [pageSize, setPageSizeState] = useState(() => {
        const saved = localStorage.getItem('crm_page_size');
        return saved ? Number(saved) : DEFAULT_PAGE_SIZE;
    });

    const setPageSize = (size: number) => {
        localStorage.setItem('crm_page_size', String(size));
        setPageSizeState(size);
        // Reset to page 1 when size changes
        setCursors([]);
    };

    const [error, setError] = useState<string | null>(null);

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showParserModal, setShowParserModal] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

    // Email Sending State
    const [activeEmailLead, setActiveEmailLead] = useState<Lead | null>(null);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilterText(filterText);
            // Reset pagination on filter change
            setCursors([]);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [filterText]);

    // Reset pagination on Status Filter change
    useEffect(() => {
        setCursors([]);
    }, [statusFilter]);

    // Fetch templates when modal opens
    useEffect(() => {
        if (activeEmailLead && emailTemplates.length === 0) {
            templateRepository.fetchTemplates().then(data => {
                setEmailTemplates(data);
                if (data.length > 0) setSelectedTemplateId(data[0].id);
            });
        }
    }, [activeEmailLead, emailTemplates.length]);

    // Load Leads
    const loadLeads = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching leads with:', {
                limit: pageSize,
                cursor: cursors.length > 0 ? cursors[cursors.length - 1] : undefined,
                status: statusFilter,
                searchQuery: debouncedFilterText
            });

            const { leads: data, count, nextCursor } = await leadRepository.fetchLeads({
                limit: pageSize,
                cursor: cursors.length > 0 ? cursors[cursors.length - 1] : undefined,
                status: statusFilter,
                searchQuery: debouncedFilterText
            });

            setLeads(data);
            if (count !== null) setTotalCount(count);
            setCurrentNextCursor(nextCursor);

        } catch (err: any) {
            console.error('Error loading leads:', err);
            setError(err.message || 'Failed to load leads');
        } finally {
            setLoading(false);
        }
    }, [pageSize, cursors, statusFilter, debouncedFilterText]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    // Handlers
    const handleNextPage = () => {
        if (currentNextCursor) {
            setCursors(prev => [...prev, currentNextCursor]);
        }
    };

    const handlePrevPage = () => {
        setCursors(prev => prev.slice(0, -1));
    };

    const handleStatusChange = async (id: string, status: LeadStatus) => {
        try {
            await leadRepository.updateLead(id, { status });
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;
        try {
            await leadRepository.deleteLead(id);
            // Reload to ensure count and pagination stay correct
            loadLeads();
        } catch (e) {
            alert('Failed to delete lead');
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingLead(undefined);
    };

    const handleEmailClick = (lead: Lead) => {
        setActiveEmailLead(lead);
    };

    const handleSendEmail = async () => {
        if (!activeEmailLead || !selectedTemplateId) return;

        setSendingEmail(true);
        try {
            const template = emailTemplates.find(t => t.id === selectedTemplateId);
            if (!template) throw new Error("Template not found");

            const scriptURL = import.meta.env.VITE_GOOGLE_WEB_APP_URL;
            if (!scriptURL) {
                alert("Configuration Error: VITE_GOOGLE_WEB_APP_URL is missing.");
                return;
            }

            // Simple replacement for now
            const filledHtml = template.htmlContent.replace(/\[Client Name\]/g, activeEmailLead.partner1_first_name || 'Client');

            await fetch(scriptURL, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'send_email',
                    to: activeEmailLead.email,
                    subject: template.title,
                    htmlBody: filledHtml
                }),
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' }
            });

            alert(`Email sent successfully to ${activeEmailLead.email}!`);
            setActiveEmailLead(null); // Close modal
        } catch (e) {
            console.error("Failed to send email", e);
            alert("Failed to send email. Check console.");
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight font-serif">
                        CRM & Leads
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
                    <button type="button" onClick={() => alert('Gmail sync placeholder')} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Sync Gmail
                    </button>
                    <button type="button" onClick={() => setShowParserModal(true)} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <BoltIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-yellow-500" aria-hidden="true" />
                        Quick Add
                    </button>
                    <button type="button" onClick={() => setShowAddModal(true)} className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        New Lead
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="Search leads by name or email..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    >
                        <option value="All">All Statuses</option>
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden flex-1 flex flex-col">
                {loading && leads.length === 0 ? (
                    // Only show full loading state on first load if no data
                    <div className="p-10 text-center">Loading...</div>
                ) : error ? (
                    <div className="p-10 text-center text-red-600">
                        <p>Error loading leads:</p>
                        <p className="font-mono text-sm mt-2">{error}</p>
                        <button onClick={loadLeads} className="mt-4 text-primary underline">Try Again</button>
                    </div>
                ) : (
                    <LeadTable
                        leads={leads}
                        totalCount={totalCount}
                        currentPage={cursors.length + 1}
                        pageSize={pageSize}
                        hasNextPage={!!currentNextCursor}
                        hasPrevPage={cursors.length > 0}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                        onPageSizeChange={setPageSize}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onEmailClick={handleEmailClick}
                    />
                )}
                {loading && leads.length > 0 && (
                    // Optional: Overlay for background loading
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-gray-900 font-semibold bg-white px-4 py-2 rounded shadow">Refreshing...</span>
                    </div>
                )}
            </div>

            <LeadFormModal
                isOpen={showAddModal}
                onClose={handleCloseModal}
                onSuccess={() => {
                    // Reset to first page on new add to see it (since ordered by created_at desc)
                    setCursors([]);
                    loadLeads();
                }}
                existingLead={editingLead}
            />

            <SmartParserModal
                isOpen={showParserModal}
                onClose={() => setShowParserModal(false)}
                onSuccess={() => {
                    setCursors([]);
                    loadLeads();
                }}
            />

            {/* Email Sending Modal */}
            {activeEmailLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                Send Email
                            </h3>
                            <button onClick={() => setActiveEmailLead(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">To:</p>
                                <p className="font-medium text-gray-900">{activeEmailLead.partner1_first_name} {activeEmailLead.partner1_last_name} &lt;{activeEmailLead.email}&gt;</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                                >
                                    {emailTemplates.map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setActiveEmailLead(null)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                                >
                                    {sendingEmail ? 'Sending...' : <><PaperAirplaneIcon className="h-4 w-4" /> Send Email</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
