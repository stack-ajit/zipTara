import Layout from '../components/Layout';
import { useTrips } from '../store/useStore';
import TripCard from '../components/TripCard';
import { Bookmark } from 'lucide-react';

const SavedTrips = () => {
    const { trips, publicTrips, user, tripsLoading: loading } = useTrips();

    // Combine all available trips to find the saved ones
    const allTrips = [...trips, ...publicTrips];

    // Deduplicate in case a trip is in both lists (unlikely but safe) -> actually Map based on ID is better?
    // For now simple filter is fine.

    const savedTrips = allTrips.filter(trip =>
        user?.savedTrips?.some(savedId => savedId.toString() === (trip.id || trip._id))
    );
    // Remove duplicates if any
    const uniqueSavedTrips = Array.from(new Set(savedTrips.map(t => t.id || t._id)))
        .map(id => savedTrips.find(t => (t.id || t._id) === id));

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex items-center space-x-3">
                    <Bookmark className="w-8 h-8 text-gray-900 fill-gray-900" />
                    <h1 className="text-3xl font-bold text-gray-900">Saved Trips</h1>
                </div>

                {loading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                        <p className="mt-4 text-gray-500">Loading saved trips...</p>
                    </div>
                ) : savedTrips.length === 0 ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                        <p className="text-gray-500">You haven't saved any trips yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {uniqueSavedTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SavedTrips;
