import { useParams, useNavigate } from 'react-router-dom';
import { useTrips } from '../store/useStore';
import Layout from '../components/Layout';
import DayCard from '../components/DayCard';
import JournalView from '../components/JournalView'; // Import JournalView
import StopForm from '../components/StopForm';
import { useState, useEffect } from 'react';
import { Share2, Plus, Calendar, MapPin, ArrowLeft, BookOpen, List, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const TripDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getTrip, fetchTrip, updateTrip, user, loading } = useTrips();
    const [trip, setTrip] = useState(null);

    // Modals state
    const [activeDayId, setActiveDayId] = useState(null);
    const [editingStop, setEditingStop] = useState(null);

    // View Mode State
    const [viewMode, setViewMode] = useState('journal'); // Default to Journal (Photo) view

    useEffect(() => {
        if (loading) return;
        const t = getTrip(id);

        const loadDetails = async () => {
            if (t) {
                // If trip exists but is a summary (no days), fetch full details
                if (!t.days) {
                    const fullTrip = await fetchTrip(id);
                    if (fullTrip) setTrip(fullTrip);
                } else {
                    setTrip(t);
                }
            } else {
                // If not in store at all (direct link), fetch it
                const fullTrip = await fetchTrip(id);
                if (fullTrip) {
                    setTrip(fullTrip);
                } else {
                    navigate('/');
                }
            }
        };
        loadDetails();
    }, [id, getTrip, fetchTrip, navigate, loading]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </Layout>
        );
    }

    if (!trip || !trip.days) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </Layout>
        );
    }

    // Determine ownership
    const tripUserId = (typeof trip.user === 'object' && trip.user !== null) ? trip.user._id : trip.user;
    const isOwner = user && (tripUserId === user._id || tripUserId === user.id);

    const handleAddDay = () => {
        if (!isOwner) return;
        const newDayId = `day${trip.days.length + 1}-${crypto.randomUUID()}`;

        let nextDate = trip.startDate;
        if (trip.days.length > 0) {
            const lastDate = new Date(trip.days[trip.days.length - 1].date);
            lastDate.setDate(lastDate.getDate() + 1);
            nextDate = lastDate.toISOString().split('T')[0];
        }

        const newDay = {
            id: newDayId,
            date: nextDate,
            stops: []
        };

        updateTrip({
            ...trip,
            days: [...trip.days, newDay]
        });
    };

    const handleDeleteDay = (dayId) => {
        if (!isOwner) return;
        if (confirm('Delete this entire day and its stops?')) {
            updateTrip({
                ...trip,
                days: trip.days.filter((d) => d.id !== dayId)
            });
        }
    };

    const handleAddStop = (formData) => {
        if (!isOwner) return;
        const newStop = { ...formData, id: crypto.randomUUID() };
        const updatedDays = trip.days.map((day) => {
            if (day.id === activeDayId) {
                return { ...day, stops: [...day.stops, newStop] };
            }
            return day;
        });
        updateTrip({ ...trip, days: updatedDays });
        setActiveDayId(null);
    };

    const handleEditStop = (formData) => {
        if (!isOwner) return;
        const updatedDays = trip.days.map((day) => {
            if (day.id === editingStop.dayId) {
                return {
                    ...day,
                    stops: day.stops.map(s => s.id === editingStop.stop.id ? { ...s, ...formData } : s)
                };
            }
            return day;
        });
        updateTrip({ ...trip, days: updatedDays });
        setEditingStop(null);
    };

    const handleDeleteStop = (dayId, stopId) => {
        if (!isOwner) return;
        const updatedDays = trip.days.map((day) => {
            if (day.id === dayId) {
                return { ...day, stops: day.stops.filter((s) => s.id !== stopId) };
            }
            return day;
        });
        updateTrip({ ...trip, days: updatedDays });
    };

    const handleShare = () => {
        if (trip.isPublic) {
            const url = `${window.location.origin}/trip/${trip.id}?view=journal`; // Can add query param support later
            navigator.clipboard.writeText(url);
            alert('Public link copied to clipboard!');
        } else {
            if (!isOwner) return;
            alert('Make this trip public to share it.');
        }
    };

    // --- RENDER JOURNAL VIEW ---
    if (viewMode === 'journal') {
        return (
            <Layout>
                <div className="relative">
                    {/* View Switcher Floating Button */}
                    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                        {isOwner && (
                            <button
                                onClick={() => setViewMode('list')}
                                className="bg-gray-900 text-white p-4 rounded-full shadow-xl hover:bg-black transition-transform hover:scale-105 flex items-center justify-center tooltip-trigger"
                                title="Switch to Editor Mode"
                            >
                                <List className="w-6 h-6" />
                            </button>
                        )}
                        {!isOwner && (
                            <button
                                onClick={() => setViewMode('list')}
                                className="bg-white text-gray-900 border border-gray-200 p-4 rounded-full shadow-lg hover:bg-gray-50 transition-transform hover:scale-105 flex items-center justify-center tooltip-trigger"
                                title="View as Timeline"
                            >
                                <List className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <JournalView trip={trip} />
                </div>
            </Layout>
        );
    }

    // --- RENDER TIMELINE/EDITOR VIEW ---
    return (
        <Layout>
            <div className="pb-20 relative">
                {/* View Switcher Floating Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setViewMode('journal')}
                        className="bg-white text-indigo-600 border border-indigo-100 p-4 rounded-full shadow-lg hover:bg-indigo-50 transition-transform hover:scale-105 flex items-center justify-center"
                        title="View as Journal"
                    >
                        <BookOpen className="w-6 h-6" />
                    </button>
                </div>

                {/* Header Section */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Link>

                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{trip.title}</h1>

                                {!isOwner && trip.user && (
                                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                                            By {typeof trip.user === 'object' ? (trip.user.fullName || trip.user.username) : 'Unknown'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1.5 text-indigo-500" />
                                        {trip.location}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" />
                                        {trip.startDate} - {trip.endDate}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                {isOwner && (
                                    <button
                                        onClick={handleAddDay}
                                        className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Day</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleShare}
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border transition-all active:scale-95 ${trip.isPublic ? 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    title={trip.isPublic ? 'Copy Public Link' : 'Trip is private'}
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Days List */}
                <div className="space-y-6">
                    {trip.days.map((day, index) => (
                        <DayCard
                            key={day.id}
                            day={day}
                            index={index}
                            onDeleteDay={() => handleDeleteDay(day.id)}
                            onAddStop={() => setActiveDayId(day.id)}
                            onDeleteStop={(stopId) => handleDeleteStop(day.id, stopId)}
                            onEditStop={(stop) => setEditingStop({ dayId: day.id, stop })}
                            readOnly={!isOwner}
                        />
                    ))}
                </div>

                {/* Empty State for Days */}
                {trip.days.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 mb-4">
                            {isOwner ? 'Start planning your itinerary by adding a day.' : 'This trip has no days added yet.'}
                        </p>
                        {isOwner && (
                            <button onClick={handleAddDay} className="text-indigo-600 font-bold hover:underline">
                                Add Day 1
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Stop Form Modal */}
            {isOwner && (activeDayId || editingStop) && (
                <StopForm
                    onClose={() => { setActiveDayId(null); setEditingStop(null); }}
                    onSave={editingStop ? handleEditStop : handleAddStop}
                    initialData={editingStop ? editingStop.stop : null}
                />
            )}
        </Layout>
    );
};

export default TripDetail;
