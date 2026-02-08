import { useState, useEffect } from 'react';
import { XMarkIcon, CodeBracketIcon, DevicePhoneMobileIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { EmailTemplate, templateRepository } from '../../services/templateRepository';

interface EmailTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: EmailTemplate;
    mode: 'edit' | 'view';
    onSave: (updatedTemplate: EmailTemplate) => void;
}

export default function EmailTemplateModal({ isOpen, onClose, template, mode, onSave }: EmailTemplateModalProps) {
    const [editContent, setEditContent] = useState('');
    const [showPreview, setShowPreview] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && template) {
            setEditContent(template.htmlContent);
        }
    }, [isOpen, template]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await templateRepository.updateTemplate(template.id, editContent);
            onSave({ ...template, htmlContent: editContent });
            onClose();
        } catch (error) {
            console.error('Failed to save template:', error);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-slide-up">

                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{template.title}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                            {mode === 'edit' ? 'Editor Mode' : 'Preview Mode'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {mode === 'edit' && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden flex">
                    {/* VIEW MODE UI */}
                    {mode === 'view' && (
                        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
                            <div className="w-full max-w-[650px] bg-white shadow-lg min-h-[600px] rounded-lg overflow-hidden">
                                <iframe
                                    srcDoc={editContent} // Use editContent to show latest state if reused
                                    title="Preview"
                                    className="w-full h-full border-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* EDIT MODE UI */}
                    {mode === 'edit' && (
                        <div className="flex-1 flex w-full">
                            {/* Left: Code Editor */}
                            <div className="flex-1 flex flex-col border-r border-gray-200">
                                <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono border-b border-gray-700 flex justify-between items-center">
                                    <span>HTML Source Code</span>
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="text-gray-300 hover:text-white flex items-center gap-1"
                                    >
                                        {showPreview ? <DevicePhoneMobileIcon className="h-4 w-4" /> : <CodeBracketIcon className="h-4 w-4" />}
                                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                                    </button>
                                </div>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
                                    spellCheck={false}
                                />
                            </div>

                            {/* Right: Live Preview */}
                            {showPreview && (
                                <div className="flex-1 bg-gray-100 flex flex-col">
                                    <div className="px-4 py-2 bg-white border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                                        Live Preview
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto flex justify-center items-start">
                                        <div className="w-full max-w-[600px] bg-white shadow-md rounded-lg overflow-hidden min-h-[500px]">
                                            <iframe
                                                srcDoc={editContent}
                                                title="Live Preview"
                                                className="w-full h-[800px] border-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
