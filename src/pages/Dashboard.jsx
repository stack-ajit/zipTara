import Layout from '../components/Layout';
import TripCard from '../components/TripCard';
import { useTrips } from '../store/useStore';
import { Map, Plus, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import TripForm from '../components/TripForm';

const Dashboard = () => {
    const { trips } = useTrips();
    const [isNewTripOpen, setIsNewTripOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [publicOnly, setPublicOnly] = useState(false);

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            const matchesSearch =
                trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trip.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPublic = publicOnly ? trip.isPublic : true;
            return matchesSearch && matchesPublic;
        });
    }, [trips, searchQuery, publicOnly]);

    return (
        <Layout>
            <div className="mb-8 space-y-6">
                {/* Search Bar Section */}
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, location, or tag"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all text-sm bg-white shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        <label className="flex items-center cursor-pointer space-x-3 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm select-none">
                            <span className="text-sm font-medium text-gray-600">Public only</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={publicOnly}
                                    onChange={() => setPublicOnly(!publicOnly)}
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${publicOnly ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${publicOnly ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {trips.length === 0 ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Map className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No trips yet</h2>
                    <p className="text-gray-500 max-w-md mb-8">
                        Create your first trip to start your travel journal.
                    </p>
                    <button
                        onClick={() => setIsNewTripOpen(true)}
                        className="flex items-center space-x-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create your first trip</span>
                    </button>
                </div>
            ) : (
                <>
                    {filteredTrips.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500">No trips match your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                            {filteredTrips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {isNewTripOpen && (
                <TripForm onClose={() => setIsNewTripOpen(false)} />
            )}
        </Layout>
    );
};

export default Dashboard;
