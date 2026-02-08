import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { setApiKey } from '../../services/geminiService';

export default function Layout() {
    const [authorized, setAuthorized] = useState(false);
    const [manualKey, setManualKey] = useState('');
    const [searchParams] = useSearchParams();
    const isEmbed = searchParams.get('mode') === 'embed';

    useEffect(() => {
        const initKey = async () => {
            // Check Environment Variable first
            const envKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (envKey) {
                setApiKey(envKey);
                setAuthorized(true);
                return;
            }

            if (window.aistudio && window.aistudio.openSelectKey) {
                try {
                    const key = await window.aistudio.openSelectKey();
                    if (key) {
                        setApiKey(key);
                        setAuthorized(true);
                    }
                } catch (e) {
                    console.error("AI Studio Key Selection cancelled or failed", e);
                }
            }
        };

        initKey();
    }, []);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualKey.trim()) {
            setApiKey(manualKey.trim());
            setAuthorized(true);
        }
    };

    if (!authorized) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                <div className="max-w-md w-full space-y-6">
                    <div>
                        <h1 className="text-5xl font-serif font-bold text-primary">Vallarta Vows</h1>
                        <p className="mt-2 text-xl text-secondary">Marketing Suite</p>
                    </div>

                    <div className="rounded-xl bg-surface p-8 shadow-lg border border-pink-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect AI</h2>
                        <p className="text-gray-600 mb-6">
                            This application requires a Google Gemini API Key to function.
                            {window.aistudio ? " Please select your key from the prompt." : " Please enter your key below."}
                        </p>

                        {!window.aistudio && (
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="apiKey" className="sr-only">API Key</label>
                                    <input
                                        type="password"
                                        id="apiKey"
                                        className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                        placeholder="Enter Gemini API Key"
                                        value={manualKey}
                                        onChange={(e) => setManualKey(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                                >
                                    Connect Manually
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    Billing may be required for extensive usage.
                                </p>
                            </form>
                        )}

                        {window.aistudio && (
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-600"
                            >
                                Retry Connection
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // If authorized and verify proper embed handling
    // Wait, if embed mode requires auth, they will be blocked by auth screen.
    // And auth screen renders normally.
    // If authorized, then check embed.

    if (isEmbed) {
        return (
            <div className="min-h-screen bg-white">
                <Outlet />
            </div>
        );
    }

    return (
        <div>
            <Sidebar />
            <main className="lg:pl-[268px]">
                <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
