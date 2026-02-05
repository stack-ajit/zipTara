import { MapPin, Mail, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (

        <footer className="relative bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300 mt-auto overflow-hidden">
            {/* Subtle Glow Effect at Top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="absolute top-0 left-1/4 right-1/4 h-24 bg-red-500/5 blur-3xl" />

            <div className="relative z-10 py-10 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Brand Column */}
                    <div className="space-y-3">
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
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Explore</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Get in Touch</h3>
                        <p className="text-sm text-slate-400 mb-3">
                            Queries, suggestions, or need help?<br />
                            <span className="text-xs">We'd love to hear from you!</span>
                        </p>
                        <a
                            href="mailto:support@ziptara.in"
                            className="inline-flex items-center space-x-2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/20 transition-all text-xs border border-white/10"
                            title="Send us an email"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            <span>support@ziptara.in</span>
                        </a>
                    </div>

                    {/* Socials & Legal */}
                    <div>
                        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Follow Us</h3>
                        <div className="flex space-x-3 mb-3">
                            <a href="https://www.instagram.com/_ziptara/" target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400 hover:text-white transition-all border border-white/10">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-white/10">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
                    <p>&copy; {new Date().getFullYear()} zipTara.
                        All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
