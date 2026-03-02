import React from 'react';
import { Mail, MessageSquare, Send, MapPin, Instagram, Twitter, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const ContactUs = () => {
    return (
        <Layout>
            <div className="pb-20">
                {/* Hero Section */}
                <div className="relative bg-slate-900 text-white overflow-hidden rounded-3xl mb-12">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 to-slate-900"></div>

                    <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-red-500/20 text-red-400 text-sm font-medium mb-6 backdrop-blur-sm border border-red-500/30">
                                Get In Touch
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                                We'd Love to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                                    Hear From You
                                </span>
                            </h1>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Have questions about ZipTara? Suggestions for new features? Or just want to say hi? Our team is always here to help.
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Contact Information</h2>
                            <p className="text-slate-600">
                                Feel free to reach out to us through any of the following channels.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ContactInfoItem
                                icon={Mail}
                                title="Email Us"
                                detail="support@ziptara.in"
                                link="mailto:support@ziptara.in"
                            />
                            <ContactInfoItem
                                icon={Twitter}
                                title="Twitter (X)"
                                detail="@_ziptara"
                                link="https://x.com/_ziptara"
                            />
                            <ContactInfoItem
                                icon={Instagram}
                                title="Instagram"
                                detail="@_ziptara"
                                link="https://www.instagram.com/_ziptara/"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

const ContactInfoItem = ({ icon: Icon, title, detail, link }) => (
    <a
        href={link}
        target={link.startsWith('http') ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-100 transition-colors group"
    >
        <div className="w-12 h-12 bg-slate-100 group-hover:bg-white rounded-xl flex items-center justify-center text-slate-600 group-hover:text-red-500 shadow-sm transition-all">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-slate-500">{detail}</p>
        </div>
    </a>
);

export default ContactUs;
