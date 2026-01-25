import { MapPin, Calendar, Clock, ArrowRight, User, ChevronLeft, ChevronRight, X, DollarSign, StickyNote, Map } from 'lucide-react';
import { useState, useEffect } from 'react';
import TripMap from './TripMap';

const JournalView = ({ trip }) => {
    const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'map'

    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState(null); // { url, index, stopId, dayId }

    const openLightbox = (url, index, stopId, dayId) => {
        setSelectedPhoto({ url, index, stopId, dayId });
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setSelectedPhoto(null);
        document.body.style.overflow = 'unset';
    };

    const navigatePhoto = (direction) => {
        if (!selectedPhoto) return;

        const { index, stopId, dayId } = selectedPhoto;
        const day = trip.days.find(d => d.id === dayId);
        const stop = day?.stops.find(s => s.id === stopId);

        if (!stop || !stop.photos) return;

        let newIndex = index + direction;

        if (newIndex >= 0 && newIndex < stop.photos.length) {
            setSelectedPhoto({
                url: stop.photos[newIndex],
                index: newIndex,
                stopId,
                dayId
            });
        }
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedPhoto) return;
            if (e.key === 'ArrowRight') navigatePhoto(1);
            if (e.key === 'ArrowLeft') navigatePhoto(-1);
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPhoto]);

    // Calculate stats
    const totalDays = trip.days.length;
    const totalStops = trip.days.reduce((acc, day) => acc + day.stops.length, 0);

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
                {/* 1. Title and Location */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                        {trip.title}
                    </h1>

                    <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider self-start md:self-center">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.location}</span>
                    </div>
                </div>

                {/* 2. Cover Image */}
                <div className="relative w-full aspect-[21/9] md:aspect-[2.5/1] overflow-hidden rounded-3xl shadow-xl mb-8">
                    {trip.cover ? (
                        <img
                            src={trip.cover}
                            alt={trip.title}
                            className="w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center text-white/20">
                            <MapPin className="w-20 h-20" />
                        </div>
                    )}
                </div>

                {/* 3. Metadata Below Image */}
                <div className="flex flex-wrap items-center gap-6 text-base text-gray-600 font-medium border-b border-gray-100 pb-8">
                    {trip.user && (
                        <div className="flex items-center text-gray-900">
                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-bold">{typeof trip.user === 'object' ? (trip.user.fullName || trip.user.username) : 'Unknown Traveler'}</span>
                        </div>
                    )}
                    <div className="hidden md:block w-px h-6 bg-gray-200" />
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-gray-200" />
                    <div className="flex items-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                            {totalDays} Days · {totalStops} Stops
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center justify-center space-x-2 mt-6">
                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'journal'
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                    >
                        Journal
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center ${activeTab === 'map'
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Map className="w-4 h-4 mr-2" />
                        Map View
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-6 z-10 transition-all duration-300">

                {activeTab === 'map' ? (
                    <div className="p-4 bg-white rounded-3xl shadow-xl min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6 px-4">Trip Route</h2>
                        <TripMap trip={trip} />
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Showing all <span className="font-bold text-gray-900">{totalStops}</span> stops across {totalDays} days.
                        </p>
                    </div>
                ) : (
                    // Journal View Content
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {trip.days.map((day, index) => (
                            <div key={day.id} className="mb-20 last:mb-0">
                                {/* Day Header */}
                                <div className="flex items-start space-x-4 mb-8 border-b-2 border-gray-100 pb-6">
                                    <h2 className="text-5xl font-black text-gray-200 select-none leading-none">
                                        {String(index + 1).padStart(2, '0')}
                                    </h2>
                                    <div className="flex-1">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                                {day.title || `Day ${index + 1}`}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1.5 text-indigo-400" />
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                                </div>

                                                {day.budget && (
                                                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                        <span className="font-bold">Budget: ₹{day.budget}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Day Notes */}
                                {day.notes && (
                                    <div className="mb-8 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100 text-gray-800 leading-relaxed flex items-start">
                                        <StickyNote className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0 mt-1" />
                                        <div className="whitespace-pre-line">{day.notes}</div>
                                    </div>
                                )}

                                {/* Stops Timeline */}
                                <div className="space-y-12 pl-4 md:pl-8 border-l-2 border-gray-100 ml-6 md:ml-12 relative">
                                    {day.stops
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map((stop) => (
                                            <div key={stop.id} className="relative group">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[calc(2rem_+_5px)] md:-left-[calc(3rem_+_1px)] top-2 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm" />

                                                {/* Stop Content */}
                                                <div className="bg-white rounded-2xl hover:bg-gray-50 transition-colors p-6 border border-gray-100 shadow-sm hover:shadow-md">

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                                        <div className="flex items-center space-x-3 text-sm font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{stop.time}</span>
                                                        </div>
                                                        {stop.cost > 0 && (
                                                            <span className="text-gray-500 text-sm font-medium bg-gray-100 px-2 py-1 rounded-md">
                                                                Cost: ₹{stop.cost}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-900 transition-colors">
                                                        {stop.title}
                                                    </h4>

                                                    {stop.desc && (
                                                        <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                                                            {stop.desc}
                                                        </p>
                                                    )}

                                                    {stop.notes && (
                                                        <div className="mb-4 text-sm text-gray-600 bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start gap-3">
                                                            <StickyNote className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                            <div className="whitespace-pre-line">
                                                                <span className="font-bold text-yellow-800 block mb-1">Traveler's Tip:</span>
                                                                {stop.notes}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Photos Grid */}
                                                    {stop.photos && stop.photos.length > 0 && (
                                                        <div className={`grid gap-4 ${stop.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                                                            {stop.photos.map((photo, i) => (
                                                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-gray-100 cursor-zoom-in group/photo" onClick={() => openLightbox(photo, i, stop.id, day.id)}>
                                                                    <img
                                                                        src={photo}
                                                                        alt={`${stop.title} ${i + 1}`}
                                                                        className="w-full h-full object-cover transform group-hover/photo:scale-105 transition-transform duration-500"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/10 transition-colors pointer-events-none" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}

                        {trip.days.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl">
                                <p className="text-gray-400">The traveler hasn't added any stories yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-2xl mx-auto text-center mt-20 px-6">
                <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">End of the Journey</h3>
                <p className="text-gray-500">Thanks for traveling along!</p>
            </div>

            {/* Lightbox Overlay */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeLightbox}>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Previous Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }}
                        className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-50 ${selectedPhoto.index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }}
                        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-50 ${(() => {
                            const day = trip.days.find(d => d.id === selectedPhoto.dayId);
                            const stop = day?.stops.find(s => s.id === selectedPhoto.stopId);
                            return stop && selectedPhoto.index === stop.photos.length - 1;
                        })() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center outline-none" onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedPhoto.url}
                            alt="Full screen"
                            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl select-none"
                        />
                        <div className="absolute -bottom-12 left-0 right-0 text-center text-white/60 text-sm font-medium tracking-widest uppercase">
                            {(() => {
                                const day = trip.days.find(d => d.id === selectedPhoto.dayId);
                                const stop = day?.stops.find(s => s.id === selectedPhoto.stopId);
                                return stop ? `${stop.title} · ${selectedPhoto.index + 1} / ${stop.photos.length}` : '';
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalView;
