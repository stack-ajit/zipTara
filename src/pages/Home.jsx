import { Search, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTrips } from '../store/useStore';
import TripCard from '../components/TripCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const { trips, publicTrips, user, tripsLoading } = useTrips();
    const [searchTerm, setSearchTerm] = useState('');
    const [greeting, setGreeting] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // Helper to get stats
    const stats = {
        totalTrips: trips.length,
        countriesVisited: new Set(trips.map(t => t.location)).size, // Mock calculation
        photosCount: trips.reduce((acc, t) => acc + (t.days?.reduce((dAcc, d) => dAcc + (d.stops?.reduce((sAcc, s) => sAcc + (s.photos?.length || 0), 0) || 0), 0) || 0), 0)
    };

    // Logic for "Get Inspired" - Now uses real public trips from other users
    const displayPublicTrips = publicTrips.filter(t => {
        // Exclude my own trips
        const tripUserId = (typeof t.user === 'object' && t.user !== null) ? t.user._id : t.user;
        const isOwner = user && (tripUserId === user._id || tripUserId === user.id);
        if (isOwner) return false;

        return (t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.location?.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <Layout>
            <div className="space-y-8 pb-20">
                {/* Hero / Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                >
                    {/* Abstract Background Decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-40"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-30"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="max-w-2xl w-full">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-3xl font-extrabold text-slate-900 leading-tight mb-2"
                            >
                                {greeting}, {user?.fullName?.split(' ')[0] || user?.username || 'Traveler'}!
                                <motion.span
                                    className="inline-block ml-2"
                                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    👋
                                </motion.span>
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Ready for an adventure?
                                </span>
                            </motion.h1>

                            {/* Search Bar & Toggle Row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-4 flex items-center gap-4"
                            >
                                <div className={`relative flex-grow max-w-lg transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                                    <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg transition-opacity duration-300 ${searchFocused ? 'opacity-30' : 'opacity-0'}`}></div>
                                    <input
                                        type="text"
                                        placeholder="Search destinations, trails, or tags..."
                                        className="relative w-full pl-6 pr-12 py-3.5 rounded-2xl border-0 shadow-lg text-gray-700 bg-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Search className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Stats Widget */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/50 min-w-[220px]"
                        >
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl text-white shadow-lg"
                                >
                                    <MapPin className="w-6 h-6" />
                                </motion.div>
                                <div>
                                    <p className="font-bold text-slate-800">Your Stats</p>
                                    <p className="text-sm text-gray-500 font-medium">
                                        <span className="text-2xl font-bold text-slate-900">{stats.totalTrips}</span> {stats.totalTrips === 1 ? 'Trip' : 'Trips'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: My Trips / Create Trip CTA */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-5 xl:col-span-4"
                    >
                        {/* Card with topographic pattern */}
                        <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                            {/* Topographic pattern simulation via SVG or gradient/image if available, else simple dashed border */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
                            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                                {/* SVG Pattern simulating topo lines */}
                                <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 200 Q 150 100 300 200 T 600 200" stroke="black" strokeWidth="0.5" />
                                    <path d="M0 250 Q 150 150 300 250 T 600 250" stroke="black" strokeWidth="0.5" />
                                    <path d="M0 150 Q 150 50 300 150 T 600 150" stroke="black" strokeWidth="0.5" />
                                </svg>
                            </div>

                            <div className="relative z-10 w-full flex flex-col items-center">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
                                >
                                    <MapPin className="text-slate-500 w-8 h-8" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {trips.length === 0 ? 'No trips yet' : 'zip your next trip'}
                                </h3>
                                <p className="text-gray-500 max-w-[200px] mb-8 text-sm">
                                    {trips.length === 0 ? 'Create your first trip to start your travel journal.' : 'Ready for a new adventure? Start zipping now.'}
                                </p>
                                <Link
                                    to="/trip/new"
                                    className="group/btn relative bg-slate-900 text-white px-6 py-3 rounded-xl font-medium shadow-xl hover:bg-black hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative text-lg pb-0.5">+</span>
                                    <span className="relative">{trips.length === 0 ? 'Create your first trip' : 'Create new trip'}</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Get Inspired */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-7 xl:col-span-8"
                    >
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Get Inspired</h2>
                            </div>

                            {tripsLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                                </div>
                            ) : displayPublicTrips.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No public trips found for inspiration yet.</p>
                                </div>
                            ) : (
                                <div className="relative group/scroll px-1">
                                    <div className="flex items-end gap-2">
                                        {/* Left Button */}
                                        <button
                                            onClick={() => document.getElementById('trips-scroll-container').scrollBy({ left: -300, behavior: 'smooth' })}
                                            className="mb-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors hidden md:block"
                                            aria-label="Scroll left"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        {/* Scroll Container */}
                                        <div id="trips-scroll-container" className="flex-1 flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6 md:overflow-x-auto pb-6 snap-y md:snap-x sleek-scrollbar scroll-smooth px-1">
                                            {displayPublicTrips.map((trip) => (
                                                <div key={trip.id} className="w-full md:min-w-[280px] md:w-auto snap-center">
                                                    <TripCard trip={trip} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right Button */}
                                        <button
                                            onClick={() => document.getElementById('trips-scroll-container').scrollBy({ left: 300, behavior: 'smooth' })}
                                            className="mb-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors hidden md:block"
                                            aria-label="Scroll right"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
