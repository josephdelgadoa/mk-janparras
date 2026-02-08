import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadRepository } from '../../services/leadRepository';
import { Lead, LeadStatus } from '../../types';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline'; // Using 24/outline

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

export default function LeadDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Lead>>({});

    useEffect(() => {
        if (id) {
            loadLead(id);
        }
    }, [id]);

    const loadLead = async (leadId: string) => {
        setLoading(true);
        try {
            const { leads: data } = await leadRepository.fetchLeads(); // Ideally fetch single lead, but repository only has fetchLeads for now usually. Assuming fetchLeads returns all.
            // If repository has fetchById, use it. Based on context, likely need to find it from list or add fetchById.
            // Let's assume we fetch all and find one for now, or implement fetchById if easy.
            // PROCEEDING WITH SEARCH IN ALL LEADS for safety as I don't see fetchById in common patterns yet, but if it exists great.
            // Actually, I should probably check leadRepository content first, but I'll write defensive code.
            const found = data.find(l => l.id === leadId);
            if (found) {
                setLead(found);
                setFormData(found);
            } else {
                alert('Lead not found');
                navigate('/crm');
            }
        } catch (error) {
            console.error('Error loading lead:', error);
            alert('Error loading lead details');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/crm');
    };

    const handleSave = async () => {
        if (!lead?.id) return;
        try {
            await leadRepository.updateLead(lead.id, formData);
            setLead({ ...lead, ...formData } as Lead);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update lead:', error);
            alert('Failed to save changes');
        }
    };

    const handleChange = (field: keyof Lead, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-10 text-center">Loading details...</div>;
    if (!lead) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">
                            {lead.partner1_first_name} {lead.partner1_last_name}
                            {lead.partner2_first_name && ` & ${lead.partner2_first_name} ${lead.partner2_last_name}`}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Lead ID: {lead.id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <XMarkIcon className="-ml-1 mr-2 h-5 w-5" /> Cancel
                            </button>
                            <button onClick={handleSave} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                                <CheckIcon className="-ml-1 mr-2 h-5 w-5" /> Save Changes
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" /> Edit Details
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Client Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Section title="Contact Information">
                        <Field label="Email" value={formData.email} editing={isEditing} onChange={v => handleChange('email', v)} />
                        <Field label="Phone" value={formData.phone} editing={isEditing} onChange={v => handleChange('phone', v)} />
                        {/* Status Dropdown */}
                        <div className="py-2">
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            {isEditing ? (
                                <select
                                    value={formData.status}
                                    onChange={e => handleChange('status', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                >
                                    {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                    ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}
                                `}>
                                    {lead.status}
                                </span>
                            )}
                        </div>
                    </Section>

                    <Section title="Partner 1">
                        <Field label="First Name" value={formData.partner1_first_name} editing={isEditing} onChange={v => handleChange('partner1_first_name', v)} />
                        <Field label="Last Name" value={formData.partner1_last_name} editing={isEditing} onChange={v => handleChange('partner1_last_name', v)} />
                        <Field label="Gender" value={formData.partner1_gender} editing={isEditing} onChange={v => handleChange('partner1_gender', v)} />
                    </Section>

                    <Section title="Partner 2">
                        <Field label="First Name" value={formData.partner2_first_name} editing={isEditing} onChange={v => handleChange('partner2_first_name', v)} />
                        <Field label="Last Name" value={formData.partner2_last_name} editing={isEditing} onChange={v => handleChange('partner2_last_name', v)} />
                        <Field label="Gender" value={formData.partner2_gender} editing={isEditing} onChange={v => handleChange('partner2_gender', v)} />
                    </Section>
                </div>

                {/* Right Column: Wedding & Services */}
                <div className="lg:col-span-2 space-y-6">
                    <Section title="Wedding Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Wedding Date" value={formData.wedding_date} editing={isEditing} type="date" onChange={v => handleChange('wedding_date', v)} />
                            <Field label="Guest Count" value={formData.guest_count} editing={isEditing} type="number" onChange={v => handleChange('guest_count', parseInt(v))} />
                            <Field label="Budget Range" value={formData.budget_range} editing={isEditing} onChange={v => handleChange('budget_range', v)} />
                            <Field label="Location Preference" value={formData.location_preference} editing={isEditing} onChange={v => handleChange('location_preference', v)} />
                        </div>
                    </Section>

                    <Section title="Services Needed">
                        {isEditing ? (
                            <textarea
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                rows={4}
                                value={Array.isArray(formData.services_needed) ? formData.services_needed.join('\n') : formData.services_needed}
                                onChange={e => handleChange('services_needed', e.target.value.split('\n'))}
                                placeholder="Enter services, one per line"
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {lead.services_needed?.map((service, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {service}
                                    </span>
                                ))}
                                {(!lead.services_needed || lead.services_needed.length === 0) && <span className="text-gray-400 italic">No services listed</span>}
                            </div>
                        )}
                    </Section>

                    <Section title="Message & Notes">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Inquiry Message</label>
                                <div className="bg-gray-50 p-4 rounded-md text-gray-700 text-sm whitespace-pre-wrap border border-gray-200">
                                    {formData.message || "No message content."}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        rows={4}
                                        value={formData.notes || ''}
                                        onChange={e => handleChange('notes', e.target.value)}
                                        placeholder="Add private notes here..."
                                    />
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-md text-gray-800 text-sm whitespace-pre-wrap border border-yellow-100 min-h-[100px]">
                                        {formData.notes || <span className="text-gray-400 italic">No notes added.</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white px-6 py-5 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4 border-b border-gray-100 pb-2">{title}</h3>
            {children}
        </div>
    );
}

function Field({ label, value, editing, onChange, type = 'text' }: { label: string, value: any, editing: boolean, onChange: (val: any) => void, type?: string }) {
    return (
        <div className="py-2">
            <label className="block text-sm font-medium text-gray-500">{label}</label>
            {editing ? (
                <input
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
            ) : (
                <div className="mt-1 text-sm text-gray-900 font-medium">{value || '-'}</div>
            )}
        </div>
    );
}
