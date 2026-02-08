import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import LoginSlider from '../components/Login/LoginSlider';
import { authService } from '../services/authService';

export default function LoginPage() {
    const navigate = useNavigate();
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identity || !password) return;

        setIsLoading(true);
        setError(null);

        // Artificial delay for "premium feel" & prevent brute-force racing
        await new Promise(r => setTimeout(r, 600));

        const { user, error: authError } = await authService.login(identity, password);

        if (authError) {
            setError(authError);
            setIsLoading(false);
            // Shake animation trigger logic could go here
        } else {
            // Success
            console.log('Logged in as:', user?.username);
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-gray-50">

            {/* LEFT PANEL: Slider (Desktop Only) */}
            <div className="hidden lg:block w-1/2 relative bg-gray-900 border-r border-gray-800 shadow-2xl z-10">
                <LoginSlider />
                {/* Angled Divider (Slash) */}
                <div className="absolute top-0 bottom-0 right-0 w-16 bg-gray-50 "
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
            </div>

            {/* RIGHT PANEL: Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">

                {/* Mobile Header (Shown only on small screens) */}
                <div className="lg:hidden absolute top-0 left-0 right-0 h-48 bg-gray-900 overflow-hidden">
                    <LoginSlider />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative z-20 mt-32 lg:mt-0"
                >
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to access your dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                                >
                                    <span className="font-medium">Error:</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email</label>
                            <input
                                type="text"
                                required
                                value={identity}
                                onChange={(e) => setIdentity(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white transition-all outline-none"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white transition-all outline-none pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
                                <input type="checkbox" className="rounded text-rose-500 focus:ring-rose-500 border-gray-300" />
                                Remember me
                            </label>
                            <a href="#" className="font-medium text-rose-500 hover:text-rose-600 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                </motion.div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-gray-400 lg:absolute lg:bottom-8">
                    Privacy Policy &bull; Terms of Service
                </p>

            </div>
        </div>
    );
}
