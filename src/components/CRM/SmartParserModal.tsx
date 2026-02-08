import { useState } from 'react';
import { leadRepository } from '../../services/leadRepository';
import { Lead, LeadStatus } from '../../types';

interface SmartParserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SmartParserModal({ isOpen, onClose, onSuccess }: SmartParserModalProps) {
    const [text, setText] = useState('');
    const [parsing, setParsing] = useState(false);

    if (!isOpen) return null;

    const parseAndSubmit = async () => {
        setParsing(true);
        try {
            console.log("Parsing text via Script...");

            // --- SCRIPT PARSER (Replacing AI) ---
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            const dataMap: any = {};

            // 0. Parse Timestamp (Expects first line)
            if (lines.length > 0) {
                const firstLine = lines[0];
                // Simple check if it looks like a date (e.g. "Jan 14, 2026")
                const possibleDate = new Date(firstLine);
                if (!isNaN(possibleDate.getTime())) {
                    dataMap.created_at = possibleDate.toISOString();
                    console.log("Captured Timestamp:", dataMap.created_at);
                }
            }

            lines.forEach((line, idx) => {
                // Heuristic: If line matches a known label, set currentLabel
                // If line doesn't match label, it's a value for the previous label
                if (line.includes('First Name (Partner 1)')) dataMap.p1_first = lines[idx + 1];
                if (line.includes('Last Name (Partner 1)')) dataMap.p1_last = lines[idx + 1];

                // Gender: Only capture if we haven't yet, or if context implies
                if (line === 'Gender') {
                    if (!dataMap.p1_gender) dataMap.p1_gender = lines[idx + 1];
                    else dataMap.p2_gender = lines[idx + 1];
                }

                if (line.includes('First Name (Partner 2)')) dataMap.p2_first = lines[idx + 1];
                if (line.includes('Last Name (Partner 2)')) dataMap.p2_last = lines[idx + 1];

                if (line.includes('Email')) dataMap.email = lines[idx + 1];
                if (line.includes('Cellphone 1')) dataMap.phone = lines[idx + 1];
                if (line.includes('Wedding Date')) dataMap.date = lines[idx + 1];
                if (line.includes('Budget')) dataMap.budget = lines[idx + 1];
                if (line.includes('Wedding Location')) dataMap.location = lines[idx + 1];
                if (line.includes('Where Staying')) dataMap.staying = lines[idx + 1];
                if (line.includes('Number of Guest')) dataMap.guests = lines[idx + 1];
                if (line.includes('How did you find us?')) dataMap.referral = lines[idx + 1];

                // Multi-line Services Parser
                if (line.includes('Other Services') || line.includes('Services Needed')) {
                    const services = [];
                    // Look ahead until next label
                    for (let j = idx + 1; j < lines.length; j++) {
                        const nextLine = lines[j];
                        // Stop if we hit a known label
                        if (nextLine.includes('Message') || nextLine.includes('First Name') || nextLine.includes('Reference')) break;
                        services.push(nextLine);
                    }
                    dataMap.services = services;
                }

                if (line.includes('Message')) {
                    // Message might be the rest of the text
                    const msgIdx = idx + 1;
                    dataMap.message = lines.slice(msgIdx).join('\n');
                }
            });

            // Fallback for Email if script missed it (Regex for safety)
            // Just in case the label isn't exactly "Email"
            if (!dataMap.email) {
                const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                if (emailMatch) dataMap.email = emailMatch[0];
            }

            if (!dataMap.email) {
                alert('Could not find an email address in the text. Please check the text format.');
                setParsing(false);
                return;
            }

            const finalLead: Partial<Lead> = {
                created_at: dataMap.created_at, // Use parsed date if available
                status: LeadStatus.NEW_LEAD,
                referral_source: dataMap.referral || 'Quick Add',
                partner1_first_name: dataMap.p1_first,
                partner1_last_name: dataMap.p1_last,
                partner1_gender: dataMap.p1_gender,
                partner2_first_name: dataMap.p2_first,
                partner2_last_name: dataMap.p2_last,
                partner2_gender: dataMap.p2_gender,
                email: dataMap.email,
                phone: dataMap.phone,
                wedding_date: dataMap.date,
                budget_range: dataMap.budget,
                location_preference: dataMap.location,
                guest_count: parseInt(dataMap.guests) || 0,
                services_needed: dataMap.services || [],
                message: dataMap.message || '' // Only use parsed message, do not fallback to full text
            };

            // 2. Save to Supabase (Database)
            console.log("Saving to Supabase...", finalLead);
            await leadRepository.createLead(finalLead);

            // 3. Save to Google Sheet (via GAS Proxy)
            const scriptUrl = import.meta.env.VITE_GOOGLE_WEB_APP_URL;
            if (scriptUrl) {
                console.log("Saving to Google Sheet...");
                // Map to GAS Payload
                // Note: GAS expects specific keys matching the frontend form names
                const gasPayload = {
                    type: "wedding_inquiry",
                    partner1_first_name: finalLead.partner1_first_name || '',
                    partner1_last_name: finalLead.partner1_last_name || '',
                    partner1_gender: finalLead.partner1_gender || '',
                    partner2_first_name: finalLead.partner2_first_name || '',
                    partner2_last_name: finalLead.partner2_last_name || '',
                    partner2_gender: finalLead.partner2_gender || '',
                    email: finalLead.email,
                    phone: finalLead.phone || '',
                    wedding_date: finalLead.wedding_date || '',
                    guest_count: finalLead.guest_count?.toString() || '',
                    budget_range: finalLead.budget_range || '',
                    location_preference: finalLead.location_preference || '',
                    referral_source: finalLead.referral_source || 'Quick Add',
                    services: finalLead.services_needed || [],
                    message: finalLead.message || ''
                };

                // Non-blocking fire-and-forget (or await if strict)
                await fetch(scriptUrl, {
                    method: 'POST',
                    body: JSON.stringify(gasPayload),
                    mode: 'no-cors', // standard for GAS
                    headers: { 'Content-Type': 'text/plain' }
                });
                console.log("Sent to GAS");
            } else {
                console.warn("GAS URL not configured, skipping Sheet sync.");
            }

            onSuccess();
            setText('');
            onClose();
        } catch (error: any) {
            alert('Failed to parse and save lead: ' + (error.message || error.toString()));
            console.error(error);
        } finally {
            setParsing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Quick Add (Smart Parser)
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-4">
                                    Paste the text from an email inquiry below. We'll try to extract the details automatically.
                                </p>
                                <textarea
                                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                                    rows={10}
                                    placeholder="Paste email content here..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            onClick={parseAndSubmit}
                            disabled={parsing || !text.trim()}
                        >
                            {parsing ? 'Parsing...' : 'Create Lead'}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
