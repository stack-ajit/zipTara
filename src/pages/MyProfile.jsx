import { useState } from 'react';
import Layout from '../components/Layout';
import { useTrips } from '../store/useStore';
import TripCard from '../components/TripCard';
import { User, Mail, Calendar, MapPin, Edit2, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const MyProfile = () => {
    const { user, trips, tripsLoading } = useTrips();
    const [activeTab, setActiveTab] = useState('trips'); // 'trips' or 'details'
    const [showPrivate, setShowPrivate] = useState(false);

    // Filter trips based on toggle
    const filteredTrips = showPrivate
        ? trips.filter(t => !t.isPublic)
        : trips;

    // Generate avatar initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Generate avatar color based on name
    const getAvatarColor = (name) => {
        if (!name) return 'bg-gradient-to-br from-indigo-500 to-purple-600';
        const colors = [
            'bg-gradient-to-br from-blue-500 to-cyan-600',
            'bg-gradient-to-br from-indigo-500 to-purple-600',
            'bg-gradient-to-br from-pink-500 to-rose-600',
            'bg-gradient-to-br from-orange-500 to-red-600',
            'bg-gradient-to-br from-green-500 to-emerald-600',
            'bg-gradient-to-br from-teal-500 to-cyan-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <Layout>
            <div className="pb-20">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 mb-8 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className={`w-32 h-32 rounded-full ${getAvatarColor(user?.fullName)} flex items-center justify-center text-white text-4xl font-bold shadow-xl`}>
                            {getInitials(user?.fullName || user?.username)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                                {user?.fullName || user?.username || 'User'}
                            </h1>
                            <div className="flex flex-col md:flex-row gap-4 text-gray-600 mb-4">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{user?.email}</span>
                                </div>
                                {user?.dob && (
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">{new Date(user.dob).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 justify-center md:justify-start">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-900">{trips.length}</p>
                                    <p className="text-xs text-gray-500">{trips.length === 1 ? 'Trip' : 'Trips'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-900">{user?.savedTrips?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Saved</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-900">
                                        {trips.reduce((acc, t) => acc + (t.stars?.length || 0), 0)}
                                    </p>
                                    <p className="text-xs text-gray-500">Tara Received</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'trips'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Trips
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'details'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Profile Details
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'trips' ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">My Trips</h2>
                            {/* Private Toggle */}
                            <button
                                onClick={() => setShowPrivate(!showPrivate)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 border ${showPrivate
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <Lock className={`w-4 h-4 ${showPrivate ? 'text-white' : 'text-gray-500'}`} />
                                <span>Private Trips</span>
                            </button>
                        </div>

                        {tripsLoading ? (
                            <div className="flex justify-center items-center min-h-[50vh]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet</h3>
                                <p className="text-gray-500 mb-6">Start your journey by creating your first trip!</p>
                            </div>
                        ) : filteredTrips.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {showPrivate ? 'No private trips' : 'No trips yet'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {showPrivate
                                        ? 'Your private collection is empty.'
                                        : 'Start your journey by creating your first trip!'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTrips.map((trip) => (
                                    <TripCard key={trip.id || trip._id} trip={trip} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Details</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900">{user?.fullName || 'Not set'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900">{user?.username}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900">{user?.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900">
                                        {user?.dob ? new Date(user.dob).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'Not set'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyProfile;
