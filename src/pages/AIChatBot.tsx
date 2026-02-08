import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatWithAdvisor } from '../services/geminiService';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, ArrowPathIcon, CodeBracketIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export default function AIChatBot() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hola! I'm Robin's AI Assistant. I can help you with wedding packages, venue ideas, or general questions about Puerto Vallarta. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const isEmbed = searchParams.get('mode') === 'embed';

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);

        try {
            const history = messages
                .filter((msg, index) => !(index === 0 && msg.role === 'model'))
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const reply = await chatWithAdvisor(history, userText);

            setMessages(prev => [...prev, { role: 'model', text: reply }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the bridal suite right now. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const containerClass = isEmbed
        ? "flex flex-col h-screen bg-white"
        : "flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden";

    return (
        <div className={containerClass}>
            <div className="bg-pink-50 p-4 border-b border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-full">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Vallarta Vows Assistant</h1>
                        <p className="text-xs text-gray-500">Online | Typical reply: Instantly</p>
                    </div>
                </div>
                {!isEmbed && (
                    <button
                        onClick={() => setShowEmbedModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-primary text-xs font-semibold rounded-lg border border-pink-200 hover:bg-pink-50 transition-colors shadow-sm"
                    >
                        <CodeBracketIcon className="h-4 w-4" />
                        Integration Guide
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 rounded-full border-gray-300 py-3 px-6 focus:ring-primary focus:border-primary shadow-sm"
                        placeholder="Ask about wedding packages..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="bg-primary text-white p-3 rounded-full hover:bg-pink-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                        {loading ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <PaperAirplaneIcon className="h-6 w-6" />}
                    </button>
                </form>
            </div>

            {/* Embed Guide Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowEmbedModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CodeBracketIcon className="h-5 w-5 text-primary" />
                                Add to WordPress (Avada)
                            </h2>
                            <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm">
                                    Follow these steps to embed this AI ChatBot into your Vallarta Vows website using the Avada Builder.
                                </p>

                                <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700 marker:text-primary marker:font-bold">
                                    <li>
                                        <strong>Log in</strong> to your WordPress Dashboard.
                                    </li>
                                    <li>
                                        Navigate to the page where you want the bot (e.g., "Contact" or "Home") and click <strong>Edit with Avada Builder</strong>.
                                    </li>
                                    <li>
                                        Add a new <strong>Container</strong> (or use an existing one) where you want the chat interface to appear.
                                    </li>
                                    <li>
                                        Search for and add the <strong>"Code Block"</strong> element.
                                    </li>
                                    <li>
                                        Copy the code snippet below and paste it into the Code Block content area:
                                        <br />
                                        <span className="text-xs text-gray-500 italic">(The code uses <code>?mode=embed</code> to hide the sidebar automatically)</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-800 relative group">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={() => {
                                            const code = `
<!-- Vallarta Vows ChatBot Widget -->
<div id="vv-chatbot-widget" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: sans-serif;">
    <!-- Welcome Message Bubble -->
    <div id="vv-chat-bubble" style="background: white; color: #333; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 12px; position: absolute; bottom: 100%; right: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: all 0.3s ease;">
        <span style="font-weight: 600;">Hi! Need help knowing more? 👋</span>
        <div style="position: absolute; bottom: -6px; right: 24px; width: 12px; height: 12px; background: white; transform: rotate(45deg);"></div>
        <button onclick="this.parentElement.style.display='none'" style="margin-left: 8px; color: #999; border: none; background: none; cursor: pointer; font-size: 16px;">&times;</button>
    </div>

    <!-- Toggle Button -->
    <button onclick="toggleVVChat()" style="width: 60px; height: 60px; border-radius: 50%; background: #D61E5C; color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(214, 30, 92, 0.4); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
        <svg id="vv-chat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg id="vv-close-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>

    <!-- Chat Frame -->
    <div id="vv-chat-frame-container" style="position: absolute; bottom: 80px; right: 0; width: 380px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 5px 30px rgba(0,0,0,0.2); overflow: hidden; display: none; transform-origin: bottom right;">
        <iframe src="${window.location.origin}/chatbot?mode=embed" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>
</div>

<script>
    // Proactive Trigger
    setTimeout(() => {
        const bubble = document.getElementById('vv-chat-bubble');
        if (bubble) {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
        }
    }, 4000);

    function toggleVVChat() {
        const container = document.getElementById('vv-chat-frame-container');
        const chatIcon = document.getElementById('vv-chat-icon');
        const closeIcon = document.getElementById('vv-close-icon');
        const bubble = document.getElementById('vv-chat-bubble');

        if (container.style.display === 'none') {
            container.style.display = 'block';
            chatIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            if(bubble) bubble.style.display = 'none'; // Hide welcome on open
        } else {
            container.style.display = 'none';
            chatIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    }
</script>`.trim();
                                            navigator.clipboard.writeText(code);
                                            alert("Code copied to clipboard!");
                                        }}
                                        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1.5 rounded-md backdrop-blur-md transition-colors"
                                    >
                                        <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                        Copy Code
                                    </button>
                                </div>
                                <div className="p-4 overflow-x-auto max-h-[300px] text-xs font-mono text-pink-300">
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>{`<div id="vv-chatbot-widget"...>
  <!-- Floating Button & Bubble -->
  <iframe src="${window.location.origin}/chatbot?mode=embed"></iframe>
  <!-- Script for Toggle & Animation -->
</div>`}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
