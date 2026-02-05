import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-2 z-50 text-slate-900 bg-white/50 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:bg-white/80 transition-all border border-gray-200"
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:fixed inset-y-0 left-0 z-40
                transform lg:transform-none transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-56 flex flex-col min-h-screen gap-10 min-w-0 overflow-x-hidden">
                {/* Main Content */}
                <main className="w-full px-4 sm:px-6 flex-grow pt-16 lg:pt-0 min-w-0">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
