import { Plus, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useTrips } from '../store/useStore';
import TripCard from '../components/TripCard';

const MyTrips = () => {
    const { trips, tripsLoading: loading } = useTrips();
    const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'

    // Filter trips based on selected filter
    const myTrips = filter === 'all'
        ? trips
        : filter === 'public'
            ? trips.filter(t => t.isPublic)
            : trips.filter(t => !t.isPublic);

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                    <div className="flex items-center gap-4">
                        {/* Public/Private Toggle */}
                        <div className="hidden sm:flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                            <button
                                onClick={() => setFilter('public')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'public'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                <span>Public</span>
                            </button>
                            <button
                                onClick={() => setFilter('private')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'private'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span>Private</span>
                            </button>
                        </div>
                        <Link
                            to="/trip/new"
                            className="flex items-center space-x-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Trip</span>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                        <p className="mt-4 text-gray-500">Loading your adventures...</p>
                    </div>
                ) : myTrips.length === 0 ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                        <p className="text-gray-500 mb-4">You haven't created any trips yet.</p>
                        <Link
                            to="/trip/new"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create your first trip
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyTrips;
