
import Sidebar from './Sidebar';

import Footer from './Footer';

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
            <div className="flex-1 ml-56 flex flex-col min-h-screen gap-10">
                {/* Main Content */}
                <main className="w-full px-6 flex-grow">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>

        </div>
    );
};

export default Layout;
