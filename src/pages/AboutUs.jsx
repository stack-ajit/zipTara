import React from 'react';
import { Compass, Globe, Users, Heart, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const AboutUs = () => {
    return (
        <Layout>
            <div className="pb-20">
                {/* Hero Section */}
                <div className="relative bg-slate-900 text-white overflow-hidden rounded-3xl mb-8">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-[50%_25%] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 to-slate-900"></div>


                    <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
                                Our Vision
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                                Reimagining How <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                    The World Travels
                                </span>
                            </h1>
                            <p className="text-xl text-white font-bold max-w-2xl mx-auto leading-relaxed ">
                                Travel is something very special for mankind, and we want that this experience is never lost, but rather perfectly preserved to inspire the generations of explorers yet to come.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card
                            icon={Compass}
                            title="Discovery First"
                            description="We believe every journey starts with a spark. Our tools are designed to turn vague ideas into concrete adventures."
                            delay={0.1}
                        />
                        <Card
                            icon={Users}
                            title="Community Driven"
                            description="Travel is better shared. We're creating a space where explorers can inspire each other and share hidden gems."
                            delay={0.2}
                        />
                        <Card
                            icon={Heart}
                            title="Built with Passion"
                            description="We are travelers first, developers second. Every feature is crafted with the actual experience of travel in mind."
                            delay={0.3}
                        />
                    </div>
                </div>

                {/* Story Section */}
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <Target className="w-8 h-8 text-blue-600" />
                                Our Mission
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                                <p>
                                    In a world of overwhelming information, planning a trip can feel like work. We wanted to bring the magic back.
                                </p>
                                <p>
                                    Started in 2026, ZipTara was born from a simple frustration: spreadsheets are boring. We envisioned a platform that feels as exciting as the trip itself : visual, intuitive, and alive.
                                </p>
                                <p>
                                    Today, we're helping thousands of travelers map out their dreams, one stop at a time. And we're just getting started.
                                </p>
                            </div>


                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80"
                                alt="Travel Planning"
                                className="relative rounded-3xl shadow-xl border border-gray-100"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Join Journey CTA Section */}
                <div className="py-24 bg-white relative overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
                    <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-8">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                                Join the journey.
                            </h2>
                            <p className="text-2xl text-slate-600 font-light">
                                We're building this together.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const Card = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
    >
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default AboutUs;
