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
                className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2.5 rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            <div className="flex-1 lg:ml-56 flex flex-col min-h-screen gap-10">
                {/* Main Content */}
                <main className="w-full px-4 sm:px-6 flex-grow pt-16 lg:pt-0">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
