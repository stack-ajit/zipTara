import { Home, Map, Bookmark, LogOut, MapPin, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTrips } from '../store/useStore';

const Sidebar = () => {
    const { logout } = useTrips();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Map, label: 'My Trips', path: '/my-trips' },
        { icon: Bookmark, label: 'Saved', path: '/saved' },
        { icon: Info, label: 'About Us', path: '/about' },
    ];

    return (
        <aside className="w-56 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 flex items-center space-x-3 mb-6">
                <MapPin className="text-white w-6 h-6" />
                <h1 className="text-xl font-bold tracking-tight">zipTara</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-white/10 text-white font-medium shadow-sm'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
