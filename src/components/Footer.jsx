import { MapPin, Mail, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (

        <footer className="bg-slate-900 text-slate-300 py-8 px-6 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Brand Column */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-white" />
                        <span className="text-2xl font-bold" style={{ fontFamily: 'Amaranth, sans-serif' }}>
                            <span className="text-white">zip</span>
                            <span className="text-red-500">Tara</span>
                        </span>
                    </div>
                    <p className="text-sm text-slate-400">
                        Safar hai, To <span className="text-slate-200 font-semibold">zipTara</span> hai.
                    </p>
                    <p className="text-xs text-slate-500">
                        Plan, share, and relive your travel memories.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-bold mb-2">Explore</h3>
                    <ul className="space-y-1 text-sm">
                        <li><Link to="/about" className="hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>About Us</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white font-bold mb-2">Contact Us</h3>
                    <p className="text-sm text-slate-400 mb-2">
                        Have questions?
                    </p>
                    <a
                        href="mailto:founder@ziptara.in"
                        className="inline-flex items-center space-x-2 text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors text-xs"
                        title="Send us an email"
                    >
                        <Mail className="w-3 h-3" />
                        <span>founder@ziptara.in</span>
                    </a>
                </div>

                {/* Socials & Legal */}
                <div>
                    <h3 className="text-white font-bold mb-2">Follow Us</h3>
                    <div className="flex space-x-3 mb-2">
                        <a href="https://www.instagram.com/_ziptara/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-colors">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-400 hover:text-white transition-colors">
                            <Twitter className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-600">
                <p>&copy; {new Date().getFullYear()} zipTara</p>
                <div className="mt-2 space-x-4">
                    <a href="#" className="hover:text-slate-400">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-400">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
