import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    UserGroupIcon,

    CameraIcon,
    ChatBubbleBottomCenterTextIcon,
    CodeBracketIcon,
    Bars3Icon,
    XMarkIcon,
    EnvelopeIcon,
    PaintBrushIcon,
    NewspaperIcon,
    ArrowLeftOnRectangleIcon,
    UserCircleIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'CRM & Leads', href: '/crm', icon: UserGroupIcon, current: false },

    { name: 'WP Form Gen', href: '/wp-form', icon: CodeBracketIcon },
    { name: 'AI ChatBot', href: '/chatbot', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Photoshoot Studio', href: '/photoshoot', icon: CameraIcon },
    { name: 'Smart Articles', href: '/smart-articles', icon: NewspaperIcon },
    { name: 'Email Marketing', href: '/email', icon: EnvelopeIcon },
    { name: 'Brand Ambassador', href: '/brand-ambassador', icon: UserCircleIcon },
    { name: 'Social Media Marketing', href: '/image-prompts', icon: PaintBrushIcon },
    { name: 'Detailed Strategy', href: '/presentation', icon: PresentationChartLineIcon },
];

export default function Sidebar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = authService.getCurrentUser();

    const getInitials = (first?: string, last?: string) => {
        return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'U';
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[268px] lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-surface px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                        <span className="text-2xl font-serif font-bold text-primary">Vallarta Vows</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <NavLink
                                                to={item.href}
                                                className={({ isActive }) =>
                                                    `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${isActive
                                                        ? 'bg-background text-primary'
                                                        : 'text-secondary hover:bg-background hover:text-primary'
                                                    }`
                                                }
                                            >
                                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                {item.name}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                    <div className="mt-auto border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt=""
                                    className="h-10 w-10 rounded-full bg-gray-50 object-cover ring-2 ring-white"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold ring-2 ring-white">
                                    {getInitials(user?.first_name, user?.last_name)}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                    {user?.first_name} {user?.last_name}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                            </div>
                        </div>

                        <button
                            onClick={authService.logout}
                            className="group flex w-full items-center gap-x-3 rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-rose-600" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden">
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button type="button" className="-m-2.5 p-2.5 text-secondary lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <span className="text-xl font-serif font-bold text-primary">Vallarta Vows</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="fixed inset-0 flex">
                        <div className="relative mr-16 flex w-full max-w-xs flex-1">
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                                    <span className="sr-only">Close sidebar</span>
                                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-surface px-6 pb-4" onClick={(e) => e.stopPropagation()}>
                                <div className="flex h-16 shrink-0 items-center">
                                    <span className="text-2xl font-serif font-bold text-primary">Vallarta Vows</span>
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.name}>
                                                        <NavLink
                                                            to={item.href}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className={({ isActive }) =>
                                                                `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${isActive
                                                                    ? 'bg-background text-primary'
                                                                    : 'text-secondary hover:bg-background hover:text-primary'
                                                                }`
                                                            }
                                                        >
                                                            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                            {item.name}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
