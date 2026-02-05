import { Search, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTrips } from '../store/useStore';
import TripCard from '../components/TripCard';
import PosterCard from '../components/PosterCard';
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
            <div className="space-y-8 pb-20 overflow-x-hidden">
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

                            {/* Search Bar & Create Trip Row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
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

                                {/* Primary CTA - Create Trip */}
                                <Link
                                    to="/trip/new"
                                    className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <span className="text-xl leading-none">+</span>
                                    <span>Create Trip</span>
                                </Link>
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

                {/* Get Inspired Section - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-full"
                >
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Get Inspired</h2>
                            <p className="text-sm text-gray-500 mt-1">Explore journeys from fellow travelers</p>
                        </div>

                        {/* Navigation Arrows - Hidden on mobile */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={() => document.getElementById('poster-scroll').scrollBy({ left: -320, behavior: 'smooth' })}
                                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => document.getElementById('poster-scroll').scrollBy({ left: 320, behavior: 'smooth' })}
                                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Poster Stream */}
                    {tripsLoading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                        </div>
                    ) : displayPublicTrips.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-dashed border-gray-200">
                            <div className="text-center">
                                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No public trips found for inspiration yet.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile: Vertical Stack */}
                            <div className="flex flex-col gap-6 md:hidden">
                                {displayPublicTrips.slice(0, 5).map((trip) => (
                                    <PosterCard key={trip.id || trip._id} trip={trip} />
                                ))}
                            </div>

                            {/* Desktop: Horizontal Scroll */}
                            <div className="hidden md:block overflow-hidden">
                                <div
                                    id="poster-scroll"
                                    className="flex gap-5 overflow-x-auto pb-4 pt-2 scroll-smooth"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    <style>{`#poster-scroll::-webkit-scrollbar { display: none; }`}</style>
                                    {displayPublicTrips.map((trip) => (
                                        <PosterCard key={trip.id || trip._id} trip={trip} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Create Trip CTA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full max-w-full"
                >
                    <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                        {/* Subtle gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-50"></div>

                        {/* Topographic line pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 200 Q 150 100 300 200 T 600 200" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
                                <path d="M0 250 Q 150 150 300 250 T 600 250" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
                                <path d="M0 150 Q 150 50 300 150 T 600 150" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
                                <path d="M0 100 Q 150 0 300 100 T 600 100" stroke="currentColor" strokeWidth="1" className="text-gray-300" />
                            </svg>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center text-center py-6">
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
                            <p className="text-gray-500 max-w-[280px] mb-6 text-sm">
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
            </div>
        </Layout>
    );
};

export default Home;
