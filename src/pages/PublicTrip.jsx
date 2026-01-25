import { useParams } from 'react-router-dom';
import { useTrips } from '../store/useStore';
import Layout from '../components/Layout';
import DayCard from '../components/DayCard';
import { Calendar, MapPin, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

const PublicTrip = () => {
    const { id } = useParams();
    const { trips } = useTrips(); // In a real app, this would fetch from an API. Here we assume local data if on same device, or mock it.
    // NOTE: Since this is localstorage only, 'public' links only work on the same machine. 
    // Detailed prompt didn't ask for backend, so this is the expected behavior for "shareable" logic in a client-only MVP.

    const [trip, setTrip] = useState(null);

    useEffect(() => {
        const found = trips.find(t => t.id === id);
        if (found && found.isPublic) {
            setTrip(found);
        }
    }, [id, trips]);

    if (!trip) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
                    <p className="text-gray-500">This trip is either private or does not exist.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="pb-20">
                {/* Badge */}
                <div className="bg-indigo-600 text-white text-center py-2 px-4 rounded-xl mb-6 shadow-md text-sm font-medium flex items-center justify-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span>Shared by a Travel Trails user</span>
                </div>

                {/* Header Section (Read Only) */}
                <div className="mb-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 relative z-10">{trip.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium relative z-10">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 text-emerald-500" />
                            {trip.location}
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-emerald-500" />
                            {trip.startDate} - {trip.endDate}
                        </div>
                    </div>
                </div>

                {/* Days List (Read Only) */}
                <div className="space-y-6">
                    {trip.days.map((day) => (
                        <DayCard
                            key={day.id}
                            day={day}
                            readOnly={true}
                        />
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default PublicTrip;
