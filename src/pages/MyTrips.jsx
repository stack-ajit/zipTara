import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useTrips } from '../store/useStore';
import TripCard from '../components/TripCard';

const MyTrips = () => {
    const { trips } = useTrips();
    const [publicOnly, setPublicOnly] = useState(false);

    // Filter by publicOnly if toggle is on
    const myTrips = publicOnly ? trips.filter(t => t.isPublic) : trips;

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 items-center gap-3 pr-3 pl-3">
                            <div className="text-xs font-semibold text-gray-500 leading-tight text-right">
                                Public<br />only
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={publicOnly}
                                    onChange={() => setPublicOnly(!publicOnly)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                            </label>
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

                {myTrips.length === 0 ? (
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
