import React, { useEffect, useState } from 'react';
import { Lead, LeadStatus } from '../../types';
import { leadRepository } from '../../services/leadRepository';

interface LeadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingLead?: Lead;
}

const emptyLead: Partial<Lead> = {
    status: LeadStatus.NEW_LEAD,
    partner1_first_name: '', partner1_last_name: '', partner1_gender: 'Bride',
    partner2_first_name: '', partner2_last_name: '', partner2_gender: 'Groom',
    email: '', phone: '',
    wedding_date: '', guest_count: 0, budget_range: '', location_preference: '',
    referral_source: '', message: '', notes: ''
};


export default function LeadFormModal({ isOpen, onClose, onSuccess, existingLead }: LeadFormModalProps) {
    const [formData, setFormData] = useState<Partial<Lead>>(emptyLead);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(existingLead ? { ...existingLead } : { ...emptyLead });
        }
    }, [isOpen, existingLead]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (existingLead && existingLead.id) {
                await leadRepository.updateLead(existingLead.id, formData);
            } else {
                await leadRepository.createLead(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            alert('Error saving lead');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <form onSubmit={handleSubmit} className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">
                            {existingLead ? 'Edit Lead' : 'Add New Lead'}
                        </h3>

                        {/* Section 1: The Couple */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1 mb-3">The Couple</h4>
                            <div className="grid grid-cols-6 gap-4 mb-4">
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">P1 First Name</label>
                                    <input type="text" name="partner1_first_name" value={formData.partner1_first_name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">P1 Last Name</label>
                                    <input type="text" name="partner1_last_name" value={formData.partner1_last_name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">P1 Gender</label>
                                    <select name="partner1_gender" value={formData.partner1_gender || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="Bride">Bride</option><option value="Groom">Groom</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">P2 First Name</label>
                                    <input type="text" name="partner2_first_name" value={formData.partner2_first_name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">P2 Last Name</label>
                                    <input type="text" name="partner2_last_name" value={formData.partner2_last_name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">P2 Gender</label>
                                    <select name="partner2_gender" value={formData.partner2_gender || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="Groom">Groom</option><option value="Bride">Bride</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1 mb-3">Contact</h4>
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Email (Required)</label>
                                    <input type="email" name="email" required value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Celebration */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1 mb-3">Celebration</h4>
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input type="text" name="wedding_date" placeholder="YYYY-MM-DD" value={formData.wedding_date || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Guests</label>
                                    <input type="number" name="guest_count" value={formData.guest_count || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Location Preference</label>
                                    <input type="text" name="location_preference" value={formData.location_preference || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div className="col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                                    <input type="text" name="budget_range" value={formData.budget_range || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="submit" disabled={saving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Lead'}
                        </button>
                        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
