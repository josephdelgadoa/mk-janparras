import { useState, useEffect, useRef } from 'react';
import {
    PencilSquareIcon,
    EyeIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    DevicePhoneMobileIcon,
    CodeBracketIcon,
    ArrowPathIcon,
    PlusCircleIcon,
    DocumentDuplicateIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { templateRepository, EmailTemplate } from '../services/templateRepository';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Fallback data in case DB is empty or fails
const defaultHtml = (title: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #db2777; padding: 30px; text-align: center; color: white; }
  .content { padding: 40px; color: #374151; line-height: 1.6; }
  .button { display: inline-block; background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
  .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <h2>Hello [Client Name],</h2>
      <p>This is a placeholder for your <strong>${title}</strong>.</p>
      <p>You can edit this HTML to customize your message, add images, and refine your branding.</p>
      <a href="#" class="button">Call to Action</a>
    </div>
    <div class="footer">
      &copy; 2026 Vallarta Vows. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const fallbackTemplates: EmailTemplate[] = [
    {
        id: 'welcome',
        title: 'Welcome Email Template',
        description: 'Sent immediately after a new lead inquiry.',
        image: 'http://www.vallartavows.com/wp-content/uploads/2026/01/hero-planning-04.jpg', // Beach Sunset
        htmlContent: defaultHtml('Welcome to Vallarta Vows')
    },
    {
        id: '2026-beach-wedding',
        title: '2026 Beach Wedding & Vow Renewals',
        description: 'Packages for intimate beach ceremonies and vow renewals.',
        image: 'http://www.vallartavows.com/wp-content/uploads/2025/07/hero-picnic-wedding-11.png',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #db2777; padding: 30px; text-align: center; color: white; }
  .content { padding: 40px; color: #374151; line-height: 1.6; }
  .button { display: inline-block; background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
  .section-title { font-size: 18px; font-weight: bold; color: #db2777; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .list-item { margin-bottom: 8px; padding-left: 20px; position: relative; }
  .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>2026 Beach Wedding & Vow Renewals</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you so much for reaching out, and congratulations on your upcoming vow renewal! 🌸</p>
      <p>I would love to help you create a simple, heartfelt beach ceremony during your stop in Puerto Vallarta. I offer beautiful Wedding Ceremony and Vow Renewal Packages on the beach, perfect for intimate celebrations, with the sound of the ocean and a stunning sunset as your backdrop.</p>
      
      <p>Please see the two package options below. Everything can also be customized to fit your preferences.</p>
      
      <p>I would be happy to schedule a quick call to review details and confirm timing with your cruise stop:</p>
      <p>👉 <a href="[Insert your Calendly link]">Book a time here</a></p>
      
      <p>Warm regards,<br>
      <strong>Robin Manoogian</strong><br>
      Vallarta Vows – Puerto Vallarta, Mexico<br>
      🌐 <a href="http://www.vallartavows.com">www.vallartavows.com</a><br>
      💌 vallartavows@gmail.com</p>

      <div class="section-title">🌴 Beach Wedding & Vow Renewal Packages – Conchas Chinas Beach</div>
      <p>I am happy to help you plan your ceremony and create a beautiful experience here in Puerto Vallarta.</p>

      <div class="section-title">💍 Package 1 – All Inclusive | $2,000 USD</div>
      <p><em>(Discounted from $2,800 – special package rate)</em></p>
      <div>✅ Planning & coordination</div>
      <div>✅ Ceremony setup with officiant</div>
      <div>✅ Archway with fresh floral décor</div>
      <div>✅ Bouquet and boutonniere for the couple</div>
      <div>✅ Professional photography (including couple, family, and guest photos)</div>
      <div>✅ Walkway mats for the ceremony area</div>
      <div>✅ Speaker and microphone for music and vows</div>
      <div>✅ Small wedding cake</div>
      <div>✅ Chairs for up to 15 guests</div>
      <div>✅ Taxes included</div>

      <div class="section-title">🌸 Package 2 – Essential Ceremony $1,500 USD</div>
      <div>✅ Planning & coordination</div>
      <div>✅ Ceremony setup with officiant</div>
      <div>✅ Archway (with draping only)</div>
      <div>✅ Bouquet and boutonniere (color preference only)</div>
      <div>✅ Professional photography</div>
      <div>✅ Walkway mats</div>
      <div>✅ Taxes included</div>

      <div class="section-title">✨ Optional Enhancements (Add-Ons)</div>
      <p>You may add these to either package:</p>
      <div>✅ Professional Wedding Video – $650 USD (Ceremony + edited highlight video)</div>
      <div>✅ Live Trio Music for Ceremony – $250 USD (Romantic live music for processional and ceremony)</div>

      <div class="section-title">💳 Payment Options</div>
      <p>Venmo or Zelle<br>(+10% applies for credit card payments)</p>

      <div class="section-title">🍽️ Reception / Dinner Recommendation</div>
      <p>If you would like to celebrate after your ceremony, I highly recommend La Palapa Restaurant, located directly on the beach in Puerto Vallarta. It offers a beautiful, romantic setting that is perfect for wedding dinners and vow renewal celebrations. 🌴✨</p>
      <p>I am happy to assist with reservations and provide menu options in advance.</p>
      <p>📂 <a href="https://drive.google.com/drive/folders/1dRZeUxTiVTsOtjMgW2ld6stzVCnSnSKn?usp=sharing">Dinner menus and details</a></p>
      <p><em>Please note: These are group menus for parties of 30+ guests. Smaller groups may order from the regular restaurant menu.</em></p>
      
      <p>Warm regards,<br>
      Robin Manoogian<br>
      Vallarta Vows – Puerto Vallarta Wedding Planning<br>
      📞 USA: +1 (646) 216-8516<br>
      📞 Mexico / WhatsApp: +52 322-170-3027</p>
    </div>
    <div class="footer">
      &copy; 2026 Vallarta Vows. All rights reserved.
    </div>
  </div>
</body>
</html>
`
    },
    {
        id: 'venues-recommendation',
        title: 'Venues Recommendation',
        description: 'Curated list of top wedding venues in Puerto Vallarta.',
        image: 'http://www.vallartavows.com/wp-content/uploads/2026/01/venues-general.png',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { padding: 0; background-color: #db2777; }
  .header img { width: 100%; height: auto; display: block; }
  .content { padding: 40px; color: #374151; line-height: 1.6; }
  .button { display: inline-block; background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
  .section-title { font-size: 18px; font-weight: bold; color: #db2777; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .venue-card { margin-bottom: 20px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
  .venue-img { width: 100%; height: 200px; background-color: #ddd; object-fit: cover; }
  .venue-info { padding: 15px; }
  .venue-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #333; }
  .venue-desc { font-size: 13px; color: #666; }
  .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
       <img src="http://www.vallartavows.com/wp-content/uploads/2026/01/venues-general.png" alt="Beautiful Wedding Venues" />
    </div>
    <div class="content">
      <p>Hello [Client Name],</p>
      <p>Finding the perfect venue is the first step to your dream wedding in Puerto Vallarta. 🌴💍</p>
      <p>I have curated a list of my absolute favorite venues that offer stunning views, privacy, and that magical atmosphere you are looking for.</p>
      
      <div class="section-title">📍 Top Beachfront Venues</div>
      
      <div class="venue-card">
        <!-- Placeholder for venue image -->
        <div class="venue-info">
            <div class="venue-name">Martoca Beach Garden</div>
            <div class="venue-desc">A mix of garden and beach, perfect for sunset ceremonies and dancing under the stars.</div>
        </div>
      </div>

      <div class="venue-card">
        <div class="venue-info">
            <div class="venue-name">Hyatt Ziva Main Beach</div>
            <div class="venue-desc">Luxury all-inclusive convenience with a private beach feel.</div>
        </div>
      </div>

      <div class="section-title">🏰 Private Villas</div>
      <p>For a more intimate and exclusive experience, consider a private villa rental.</p>
      
      <p>I would love to walk you through the pros and cons of each.</p>
      
      <a href="[Insert Booking Link]" class="button">Schedule Venue Tour Call</a>
      
      <p>Warm regards,<br>
      <strong>Robin Manoogian</strong><br>
      Vallarta Vows</p>
    </div>
    <div class="footer">
      &copy; 2026 Vallarta Vows. All rights reserved.
    </div>
  </div>
</body>
</html>
`
    },
    {
        id: 'followup1',
        title: 'Follow up 1 Email Template',
        description: 'First check-in 3 days after no response.',
        image: 'http://www.vallartavows.com/wp-content/uploads/2026/01/follow-up-1-letter-2.png', // Elegant Dinner
        htmlContent: defaultHtml('Just Checking In')
    },
    {
        id: 'followup2',
        title: 'Follow up 2 Email Template',
        description: 'Second nudging email with value proposition.',
        image: 'http://www.vallartavows.com/wp-content/uploads/2026/01/follow-up-2-letter-2.png', // Rings Details
        htmlContent: defaultHtml('Thinking of Your Big Day?')
    },
    {
        id: 'thankyou',
        title: 'Thank you Email Template',
        description: 'Sent after a consultation call.',
        image: 'http://www.vallartavows.com/wp-content/uploads/2026/02/thank-you-hero-email.png', // Champagne/Celebration
        htmlContent: defaultHtml('Thank You for Chatting')
    }
];

// Sortable Item Component
function SortableItem({ template, handleOpen, handleDuplicate, handleDelete }: { template: EmailTemplate, handleOpen: any, handleDuplicate: any, handleDelete: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: template.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-move h-full">
            <div className="h-40 overflow-hidden relative group">
                <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={template.title}>{template.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">{template.description}</p>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpen(template.id, 'edit'); }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-primary hover:text-primary transition-all cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(template.id); }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer"
                        title="Duplicate Template"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Copy
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpen(template.id, 'view'); }}
                        className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-pink-700 transition-colors shadow-sm cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <EyeIcon className="h-4 w-4" />
                        View
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                        className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-gray-200 rounded-lg hover:bg-white hover:border-red-600 transition-all cursor-pointer mt-2"
                        title="Delete Template"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EmailMarketing() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [mode, setMode] = useState<'edit' | 'view' | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [showPreview, setShowPreview] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const ignoreNextUpdate = useRef(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );



    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            console.log("Loading templates from repository...");
            const data = await templateRepository.fetchTemplates();
            console.log("Templates loaded:", data);

            let templatesToSet = [];
            if (data.length > 0) {
                templatesToSet = data;
            } else {
                console.log("No templates found in DB, using fallback");
                templatesToSet = fallbackTemplates;
            }

            // Enforce specific order ONLY if no position set? 
            // Better to rely on DB order if data is there.
            // If DB returns data, we trust its order (which we added .order('position') to fetch).
            // However, for fallback templates, we might want to manually set positions if they don't have them?

            // If data came from DB, it's already sorted.
            if (data.length === 0) {
                console.log("No templates found in DB, using fallback");
                templatesToSet = fallbackTemplates.map((t, i) => ({ ...t, position: i }));
            } else {
                templatesToSet = data;
            }

            setTemplates(templatesToSet);



            setTemplates(templatesToSet);
        } catch (e) {
            console.error("Failed to load templates", e);
            setTemplates(fallbackTemplates);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fix for ALL Template Images (Migration)
    // DISABLED: This was reverting manual changes.
    // useEffect(() => {
    //     if (templates.length > 0) {
    //         templates.forEach(t => {
    //             const fallback = fallbackTemplates.find(ft => ft.id === t.id);
    //             if (fallback && t.image !== fallback.image) {
    //                 console.log(`Migrating image for ${t.id}...`);
    //                 templateRepository.updateTemplateImage(t.id, fallback.image)
    //                     .then(() => {
    //                         console.log(`Migration complete for ${t.id}`);
    //                         setTemplates(prev => prev.map(pt =>
    //                             pt.id === t.id ? { ...pt, image: fallback.image } : pt
    //                         ));
    //                     })
    //                     .catch(err => console.error(`Migration failed for ${t.id}:`, err));
    //             }
    //         });
    //     }
    // }, [templates]);

    // Sync Source -> Iframe
    useEffect(() => {
        if (mode === 'edit' && iframeRef.current) {
            if (ignoreNextUpdate.current) {
                ignoreNextUpdate.current = false;
                return;
            }

            const doc = iframeRef.current.contentDocument;
            if (doc) {
                // If the doc is empty or completely different, writing logic
                if (doc.documentElement.innerHTML !== editContent) {
                    doc.open();
                    doc.write(editContent);
                    doc.close();

                    // Inject explicit contenteditable and listeners
                    injectEditableLogic(doc);
                }
            }
        }
    }, [editContent, mode]);

    const injectEditableLogic = (doc: Document) => {
        // Ensure body is editable
        if (doc.body) {
            doc.body.contentEditable = "true";
            doc.body.style.outline = "none"; // Remove default outline

            // Add Styles for visual clue
            const style = doc.createElement('style');
            style.textContent = `
                body:hover { background-color: rgba(0,0,0,0.01); }
            `;
            doc.head.appendChild(style);

            // Listener
            doc.body.addEventListener('input', () => {
                ignoreNextUpdate.current = true;
                const newContent = doc.documentElement.outerHTML;
                setEditContent(newContent);
            });
        }
    };

    // When modal opens, we might need a small delay or check to write initial content
    // The above effect handles it IF editContent is set. 
    // But when switching templates, editContent changes? Yes.

    const activeTemplate = templates.find(t => t.id === activeTemplateId);

    const handleOpen = (id: string, mode: 'edit' | 'view') => {
        const t = templates.find(temp => temp.id === id);
        if (t) {
            setActiveTemplateId(id);
            setMode(mode);
            setEditContent(t.htmlContent);
            setEditTitle(t.title);
            setTestEmail('');
            setSending(false);
        }
    };

    const handleClose = () => {
        setActiveTemplateId(null);
        setMode(null);
    };

    const handleSave = async () => {
        if (!activeTemplateId) return;
        setSaving(true);
        try {
            console.log("Saving template...", activeTemplateId);
            // Update DB
            // If it's the custom template, use upsert
            if (activeTemplateId === 'custom') {
                await templateRepository.upsertTemplate(activeTemplateId, {
                    title: editTitle,
                    htmlContent: editContent,
                    description: 'Custom email draft',
                    image: 'http://www.vallartavows.com/wp-content/uploads/2026/01/thank-you-letter.png' // Default image
                });
            } else {
                await templateRepository.updateTemplate(activeTemplateId, editContent, editTitle);
            }

            // Update Local State
            setTemplates(prev => {
                const existing = prev.find(t => t.id === activeTemplateId);
                if (existing) {
                    return prev.map(t =>
                        t.id === activeTemplateId ? { ...t, htmlContent: editContent, title: editTitle } : t
                    );
                } else {
                    // Start new if not found (e.g. custom first save)
                    // We need to reload or append. Appending is easier.
                    const newTemplate: EmailTemplate = {
                        id: activeTemplateId,
                        title: editTitle,
                        description: 'Custom email draft',
                        image: 'http://www.vallartavows.com/wp-content/uploads/2026/01/thank-you-letter.png',
                        htmlContent: editContent,
                        updatedAt: new Date().toISOString()
                    };
                    return [...prev, newTemplate];
                }
            });
            console.log("Template saved successfully");
            handleClose();
        } catch (e) {
            console.error("Error saving template:", e);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail) return alert("Please enter an email address.");
        setSending(true);

        const scriptURL = import.meta.env.VITE_GOOGLE_WEB_APP_URL;

        if (!scriptURL) {
            alert("Configuration Error: VITE_GOOGLE_WEB_APP_URL is missing. Simulating send.");
            setTimeout(() => setSending(false), 1000);
            return;
        }

        try {
            await fetch(scriptURL, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'send_email',
                    to: testEmail,
                    subject: editTitle || activeTemplate?.title || 'Test Email from Vallarta Vows',
                    htmlBody: editContent || activeTemplate?.htmlContent || '<h1>Test</h1>'
                }),
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' }
            });
            alert(`Test email command sent to ${testEmail}!`);
        } catch (e) {
            console.error(e);
            alert("Failed to send command. Check console.");
        } finally {
            setSending(false);
        }
    };

    const handleCustomEmail = async () => {
        const customId = 'custom';
        const existingCustom = templates.find(t => t.id === customId);

        let templateToUse = existingCustom;

        if (!existingCustom) {
            // Find "Thank you" template to clone
            const thankYouTemplate = templates.find(t => t.id === 'thankyou') || fallbackTemplates.find(t => t.id === 'thankyou');

            // If not found, fall back to first available or generic
            const base = thankYouTemplate || templates[0] || fallbackTemplates[0];

            templateToUse = {
                ...base,
                id: customId,
                title: 'Custom Email',
                description: 'Custom email draft'
            };

            // We don't save to DB yet, just set in local state? 
            // Better to add to local templates list so the modal can find it via activeTemplateId
            setTemplates(prev => [...prev, templateToUse!]);
        }

        handleOpen(customId, 'edit');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setTemplates((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over?.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Persist
                const updates = newOrder.map((t, index) => ({
                    id: t.id,
                    position: index
                }));
                templateRepository.updateTemplateOrder(updates)
                    .catch(err => console.error("Failed to save order", err));

                return newOrder;
            });
        }
    };

    const handleDuplicate = async (id: string) => {
        const original = templates.find(t => t.id === id);
        if (!original) return;

        const newId = `${original.id}-copy-${Date.now()}`;
        const newTemplate: EmailTemplate = {
            ...original,
            id: newId,
            title: `${original.title} (Copy)`,
            updatedAt: new Date().toISOString()
        };

        try {
            // Optimistic UI update
            setTemplates(prev => [...prev, newTemplate]);

            // Persist
            await templateRepository.upsertTemplate(newId, {
                title: newTemplate.title,
                htmlContent: newTemplate.htmlContent,
                description: newTemplate.description,
                image: newTemplate.image
            });
            console.log("Template duplicated:", newId);
        } catch (e) {
            console.error("Failed to duplicate template", e);
            alert("Failed to duplicate template.");
            // Revert on failure (could improve this, but fine for now)
            setTemplates(prev => prev.filter(t => t.id !== newId));
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            // Optimistic UI Update
            setTemplates(prev => prev.filter(t => t.id !== deleteId));

            setDeleteId(null); // Close modal immediately

            // Persist
            await templateRepository.deleteTemplate(deleteId);
        } catch (e) {
            console.error("Failed to delete template", e);
            alert("Failed to delete template. Please refresh.");
            loadTemplates(); // Revert
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Email Marketing Studio</h1>
                    <p className="text-secondary mt-2">Manage and customize your automated email sequences.</p>
                </div>
                <button
                    onClick={handleCustomEmail}
                    className="flex items-center gap-2 px-5 py-3 bg-pink-600 text-white font-bold rounded-lg shadow-md hover:bg-pink-700 transition-all transform hover:scale-105"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    Send a custom email
                </button>
            </div>

            {/* Template Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SortableContext items={templates.map(t => t.id)} strategy={rectSortingStrategy}>
                        {templates.map((template) => (
                            <SortableItem
                                key={template.id}
                                template={template}
                                handleOpen={handleOpen}
                                handleDuplicate={handleDuplicate}
                                handleDelete={handleDeleteClick}
                            />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>

            {/* Modal Overlay */}
            {activeTemplate && mode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-slide-up">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{activeTemplate.title}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                                    {mode === 'edit' ? 'Editor Mode' : 'Preview Mode'}
                                </p>
                            </div>

                            {/* Title Editor in Edit Mode */}
                            {mode === 'edit' && (
                                <div className="flex-1 mx-6">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent font-bold text-gray-800 placeholder-gray-400"
                                        placeholder="Email Subject Line"
                                    />
                                </div>
                            )}

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
                                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden flex">

                            {/* VIEW MODE UI */}
                            {mode === 'view' && (
                                <div className="flex-1 flex flex-col">
                                    {/* Toolbar */}
                                    <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center gap-4">
                                        <div className="flex-1 flex items-center gap-2 max-w-lg">
                                            <input
                                                type="email"
                                                placeholder="Enter email for test send..."
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                value={testEmail}
                                                onChange={(e) => setTestEmail(e.target.value)}
                                            />
                                            <button
                                                onClick={handleSendTest}
                                                disabled={sending || !testEmail}
                                                className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors"
                                            >
                                                {sending ? 'Sending...' : <><PaperAirplaneIcon className="h-4 w-4" /> Send Email</>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Frame */}
                                    <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
                                        <div className="w-full max-w-[650px] bg-white shadow-lg min-h-[600px] rounded-lg overflow-hidden">
                                            <iframe
                                                srcDoc={activeTemplate.htmlContent}
                                                title="Preview"
                                                className="w-full h-full border-none"
                                            />
                                        </div>
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
                                                        ref={iframeRef}
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
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-up">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-3 rounded-full mb-4">
                                <TrashIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Template?</h3>
                            <p className="text-gray-500 mb-6">Are you sure you want to delete this email template? This action cannot be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
