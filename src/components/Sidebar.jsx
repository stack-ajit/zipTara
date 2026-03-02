import { Home, Bookmark, LogOut, MapPin, Info, User, Sparkle, LogIn, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTrips } from '../store/useStore';

const Sidebar = ({ onClose }) => {
    const { logout, user, unreadCount } = useTrips();

    const navItems = [
        { icon: Home, label: 'Home', path: '/', protected: true },
        { icon: Bookmark, label: 'Saved', path: '/saved', protected: true },
        { icon: User, label: 'Settings', path: '/settings', protected: true },
        { icon: Sparkle, label: 'Notifications', path: '/notifications', badge: unreadCount, protected: true },
        { icon: User, label: 'My Profile', path: '/profile', protected: true },
        { icon: Info, label: 'About Us', path: '/about', protected: false },
        { icon: Mail, label: 'Contact Us', path: '/contact', protected: false },
    ];

    const filteredNavItems = navItems.filter(item => !item.protected || user);

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <aside className="w-56 bg-slate-900 text-white min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 flex items-center space-x-3 mb-6">
                <MapPin className="text-white w-6 h-6" />
                <span className="text-2xl font-bold" style={{ fontFamily: 'Amaranth, sans-serif' }}>
                    <span className="text-white">zip</span>
                    <span className="text-red-500">Tara</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-white/10 text-white font-medium shadow-sm'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <div className="relative">
                            <item.icon className="w-5 h-5" />
                            {item.badge > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </div>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10">
                {user ? (
                    <button
                        onClick={() => { logout(); if (onClose) onClose(); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                ) : (
                    <NavLink
                        to="/login"
                        onClick={handleNavClick}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>Login</span>
                    </NavLink>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
