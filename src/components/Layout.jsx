
import Sidebar from './Sidebar';

const Layout = ({ children }) => {

    // Provide context or props to children if needed, 
    // but for now we'll just expose the modal opener via a prop if we were doing prop drilling,
    // or better, keeping the modal at Layout level is fine.
    // However, the "New Trip" button might be on the dashboard or sidebar.
    // Since sidebar is fixed, we might want a global "New Trip" FAB or just keep it in specific pages.
    // The previous header had "New Trip". 

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-56">
                {/* Main Content */}
                <main className="w-full px-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 border-t border-gray-100 mt-auto">
                    <p>© {new Date().getFullYear()} Travel Trails. Built for explorers.</p>
                    <p className="mt-2 md:mt-0">Meet your Travel Goals.</p>
                </footer>
            </div>

        </div>
    );
};

export default Layout;
