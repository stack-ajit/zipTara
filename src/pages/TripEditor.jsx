import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrips } from '../store/useStore';
import { ChevronLeft, ChevronRight, Upload, Trash2, Plus, Calendar, DollarSign, Image as ImageIcon, Check, X, MapPin } from 'lucide-react';

import LocationInput from '../components/LocationInput';
import api from '../services/api';

const TripEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addTrip, getTrip, updateTrip } = useTrips();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState(null); // { url, index, stopId, dayId }

    const openLightbox = (url, index, stopId, dayId) => {
        setSelectedPhoto({ url, index, stopId, dayId });
    };

    const closeLightbox = () => {
        setSelectedPhoto(null);
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

    // Load trip data
    useEffect(() => {
        // Prevent overwriting local state on background re-renders if we already have this trip loaded
        if (trip && (trip.id === id || trip._id === id)) return;

        // If no ID (route is /trip/new) or explicit 'new', creates a draft
        if (!id || id === 'new') {
            setTrip({
                id: crypto.randomUUID(), // specific ID for draft
                title: '',
                location: '',
                coordinates: null, // Init coordinates
                startDate: '',
                endDate: '',
                cover: '',
                isPublic: false,
                tags: [],
                days: []
            });
            setLoading(false);
        } else {
            const t = getTrip(id);
            if (t) {
                const tripData = JSON.parse(JSON.stringify(t));
                // Ensure arrays exist
                if (!tripData.days) tripData.days = [];
                if (!tripData.tags) tripData.tags = [];
                setTrip(tripData);
                setLoading(false);
            } else {
                // If trip isn't in store yet (e.g. refresh), valid fetchTrip logic might be needed here or handled by useStore initial load
                // For now, if getTrip returns null/undefined, we wait or redirect.
                // Assuming useStore fetches all. If page refresh, store might be empty initially.
                // We should rely on store's loading state but for now this check handles the overwrite.
                // If t is null but we are loading, do nothing?
                // The original code navigated to / which is aggressive if store is just loading.
                // But let's stick to the minimal fix for the overwrite bug first.
                // navigate('/'); // Commented out to avoid redirect loop during loading? 
                // No, original code had navigate('/').
            }
        }
    }, [id, getTrip, navigate, trip]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        console.log("Saving trip...", trip);
        console.log("Cover value:", trip.cover, "Type:", typeof trip.cover);

        setIsSaving(true);
        try {
            let savedTrip;
            // Clean up stops to ensure no weird data
            const cleanedTrip = {
                ...trip,
                // Ensure cover is a string (handle potential object bug)
                cover: (typeof trip.cover === 'string') ? trip.cover : '',
                // Ensure location is a string
                location: (typeof trip.location === 'string') ? trip.location : '',

                days: trip.days.map(d => ({
                    ...d,
                    stops: d.stops.map(s => ({
                        ...s,
                        // Ensure coordinates are numbers if present
                        coordinates: s.coordinates ? {
                            lat: Number(s.coordinates.lat),
                            lng: Number(s.coordinates.lng)
                        } : undefined
                    }))
                }))
            };

            if (!id || id === 'new') {
                savedTrip = await addTrip(cleanedTrip);
            } else {
                savedTrip = await updateTrip(cleanedTrip);
            }

            if (savedTrip) {
                navigate(`/trip/${savedTrip._id || savedTrip.id}`);
            } else {
                throw new Error("Save operation returned null");
            }
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save trip. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('image', file);
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTrip(prev => ({ ...prev, cover: res.data.url }));
            } catch (err) {
                console.error("Upload Error:", err);
                alert("Failed to upload image");
            }
        }
    };

    const handleStopPhotoUpload = async (e, dayId, stopId) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            try {
                const formData = new FormData();
                // Append all files with key 'images'
                for (let i = 0; i < files.length; i++) {
                    formData.append('images', files[i]);
                }

                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setTrip(prev => ({
                    ...prev,
                    days: prev.days.map(d => {
                        if (d.id === dayId) {
                            return {
                                ...d,
                                stops: d.stops.map(s => {
                                    if (s.id === stopId) {
                                        // Handle both single url (legacy backup) and urls array
                                        const newPhotos = res.data.urls ? res.data.urls : (res.data.url ? [res.data.url] : []);
                                        return { ...s, photos: [...(s.photos || []), ...newPhotos] };
                                    }
                                    return s;
                                })
                            };
                        }
                        return d;
                    })
                }));
            } catch (err) {
                console.error("Stop Photo Upload Error:", err);
                alert("Failed to upload photos");
            }
        }
    };

    // Day & Stop Management
    const addDay = () => {
        const newDay = {
            id: `day-${crypto.randomUUID()}`,
            date: '',
            title: '',
            budget: '',
            notes: '',
            stops: []
        };
        setTrip(prev => ({ ...prev, days: [...prev.days, newDay] }));
    };

    const removeDay = (dayId) => {
        setTrip(prev => ({ ...prev, days: prev.days.filter(d => d.id !== dayId) }));
    };

    const updateDay = (dayId, field, value) => {
        setTrip(prev => ({
            ...prev,
            days: prev.days.map(d => d.id === dayId ? { ...d, [field]: value } : d)
        }));
    };

    const addStop = (dayId) => {
        const newStop = {
            id: `stop-${crypto.randomUUID()}`,
            time: '09:00',
            title: '',
            desc: '',
            cost: 0,
            notes: '',
            coordinates: null,
            photos: []
        };
        setTrip(prev => ({
            ...prev,
            days: prev.days.map(d =>
                d.id === dayId ? { ...d, stops: [...d.stops, newStop] } : d
            )
        }));
    };

    const updateStop = (dayId, stopId, field, value) => {
        setTrip(prev => ({
            ...prev,
            days: prev.days.map(d => {
                if (d.id === dayId) {
                    return {
                        ...d,
                        stops: d.stops.map(s => {
                            if (s.id === stopId) {
                                // If field is object, spread it (batch update)
                                if (typeof field === 'object') {
                                    return { ...s, ...field };
                                }
                                return { ...s, [field]: value };
                            }
                            return s;
                        })
                    };
                }
                return d;
            })
        }));
    };

    const removeStop = (dayId, stopId) => {
        setTrip(prev => ({
            ...prev,
            days: prev.days.map(d => d.id === dayId ? { ...d, stops: d.stops.filter(s => s.id !== stopId) } : d)
        }));
    };

    if (loading || !trip) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: EDITOR */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Trip Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Trip details</h2>

                            {/* Cover Image */}
                            <div className="relative h-48 rounded-xl bg-gray-100 overflow-hidden mb-6 group">
                                {trip.cover ? (
                                    <img src={trip.cover} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute bottom-3 right-3 flex space-x-2">
                                    <button
                                        onClick={() => setTrip(prev => ({ ...prev, cover: '' }))}
                                        className="px-3 py-1.5 bg-white text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-50 text-red-600"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('cover-upload-editor').click()}
                                        className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-black flex items-center"
                                    >
                                        <Upload className="w-3 h-3 mr-1" /> Upload
                                    </button>
                                    <input id="cover-upload-editor" type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Trip Name"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                                    value={trip.title}
                                    onChange={(e) => setTrip(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <LocationInput
                                    className="p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                                    placeholder="Location"
                                    value={trip.location}
                                    onChange={(val) => setTrip(prev => ({ ...prev, location: val }))}
                                    onSelect={(data) => setTrip(prev => ({
                                        ...prev,
                                        location: data.fullLocation || data.title,
                                        coordinates: data.coordinates // Save trip coordinates too!
                                    }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input
                                    type="date"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm text-gray-600"
                                    value={trip.startDate}
                                    onChange={(e) => setTrip(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                                <input
                                    type="date"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none text-sm text-gray-600"
                                    value={trip.endDate}
                                    onChange={(e) => setTrip(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                                <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="text-sm">
                                        <span className="block font-medium text-gray-700">{trip.isPublic ? 'Public' : 'Private'}</span>
                                        <span className="text-[10px] text-gray-400">{trip.isPublic ? 'Visible to all' : 'Only you can see'}</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${trip.isPublic ? 'bg-gray-900' : 'bg-gray-200'}`} onClick={(e) => { e.preventDefault(); setTrip(prev => ({ ...prev, isPublic: !prev.isPublic })); }}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${trip.isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>

                            <div className="w-full">
                                <div className="flex flex-wrap items-center gap-2 w-full p-3 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent bg-white transition-shadow">
                                    {trip.tags && trip.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 animate-fadeIn">
                                            {tag}
                                            <button
                                                onClick={() => setTrip(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                                                className="ml-1.5 text-gray-400 hover:text-red-500 focus:outline-none"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder={trip.tags?.length > 0 ? "" : "Add a tag (e.g. budget, beach)"}
                                        className="flex-1 outline-none text-sm min-w-[150px] bg-transparent"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.target.value.trim();
                                                if (val && !trip.tags?.includes(val)) {
                                                    setTrip(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                                                    e.target.value = '';
                                                }
                                            } else if (e.key === 'Backspace' && e.target.value === '' && trip.tags?.length > 0) {
                                                // Allow deleting last tag with backspace
                                                setTrip(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itinerary Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Itinerary (day-wise)</h2>
                            <button
                                onClick={addDay}
                                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add day
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm mb-6">Add days and fill in stops, timings, tips, and photos for each day.</p>

                        <div className="space-y-8">
                            {trip.days?.map((day, dIndex) => (
                                <div key={day.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gray-50/30">
                                    {/* Day Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span>Day {dIndex + 1}</span>
                                        </div>
                                        <button onClick={() => removeDay(day.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="date"
                                            className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900"
                                            value={day.date}
                                            onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Title (e.g. Beach Day)"
                                            className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900"
                                            value={day.title || ''}
                                            onChange={(e) => updateDay(day.id, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Budget"
                                                className="w-full pl-8 p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900"
                                                value={day.budget || ''}
                                                onChange={(e) => updateDay(day.id, 'budget', e.target.value)}
                                            />
                                        </div>
                                        <textarea
                                            rows="3"
                                            placeholder="Notes for the day (press Enter for new lines)"
                                            className="p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900 resize-none"
                                            value={day.notes || ''}
                                            onChange={(e) => updateDay(day.id, 'notes', e.target.value)}
                                        />
                                    </div>

                                    {/* Stops List */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-bold text-gray-800">Stops</h4>
                                            <button onClick={() => addStop(day.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                                                <Plus className="w-3 h-3 mr-1" /> Add stop
                                            </button>
                                        </div>

                                        {day.stops.length === 0 ? (
                                            <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                                <p className="text-xs text-gray-400">No stops yet.</p>
                                            </div>
                                        ) : (
                                            day.stops.map((stop) => (
                                                <div key={stop.id} className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                                                    <button onClick={() => removeStop(day.id, stop.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div className="grid grid-cols-3 gap-4 mb-3 pr-8">
                                                        <input
                                                            type="time"
                                                            className="col-span-1 p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900 bg-gray-50"
                                                            value={stop.time}
                                                            onChange={(e) => updateStop(day.id, stop.id, 'time', e.target.value)}
                                                        />
                                                        <div className="col-span-2">
                                                            <LocationInput
                                                                className="p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900 bg-gray-50"
                                                                placeholder="Place Name"
                                                                value={stop.title}
                                                                onChange={(val) => updateStop(day.id, stop.id, 'title', val)}
                                                                onSelect={(data) => updateStop(day.id, stop.id, {
                                                                    title: data.title,
                                                                    coordinates: data.coordinates
                                                                })}
                                                            />
                                                            {stop.coordinates && (
                                                                <span className="text-[10px] text-green-600 ml-1">
                                                                    📍 {stop.coordinates.lat.toFixed(2)}, {stop.coordinates.lng.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        rows="2"
                                                        placeholder="Describe this stop..."
                                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-900 mb-3 resize-none bg-gray-50"
                                                        value={stop.desc || ''}
                                                        onChange={(e) => updateStop(day.id, stop.id, 'desc', e.target.value)}
                                                    />

                                                    {/* Photos section */}
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-gray-500">Photos</span>
                                                            <button
                                                                onClick={() => document.getElementById(`photo-upload-${stop.id}`).click()}
                                                                className="flex items-center text-xs font-bold text-gray-400 hover:text-gray-900 border px-2 py-1 rounded-md transition-colors"
                                                            >
                                                                <ImageIcon className="w-3 h-3 mr-1" /> Add
                                                            </button>
                                                            <input
                                                                id={`photo-upload-${stop.id}`}
                                                                type="file"
                                                                multiple
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleStopPhotoUpload(e, day.id, stop.id)}
                                                            />
                                                        </div>
                                                        {stop.photos && stop.photos.length > 0 && (
                                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                                {stop.photos.map((photo, pIndex) => (
                                                                    <div key={pIndex} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 group/photo cursor-pointer" onClick={() => openLightbox(photo, pIndex, stop.id, day.id)}>
                                                                        <img src={photo} alt="Stop" className="w-full h-full object-cover" />
                                                                        <button
                                                                            onClick={() => {
                                                                                setTrip(prev => ({
                                                                                    ...prev,
                                                                                    days: prev.days.map(d => d.id === day.id ? {
                                                                                        ...d, stops: d.stops.map(s => s.id === stop.id ? {
                                                                                            ...s, photos: s.photos.filter((_, i) => i !== pIndex)
                                                                                        } : s)
                                                                                    } : d)
                                                                                }));
                                                                            }}
                                                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Add Stop Button at Bottom */}
                                    {day.stops.length > 0 && (
                                        <button
                                            onClick={() => addStop(day.id)}
                                            className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-xs font-bold flex items-center justify-center hover:border-gray-400 hover:text-gray-700 transition-colors"
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add another stop
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Day Button at Bottom */}
                        {trip.days.length > 0 && (
                            <button
                                onClick={addDay}
                                className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl text-sm font-bold flex items-center justify-center hover:border-gray-400 hover:text-gray-800 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Add another day
                            </button>
                        )}
                    </div>


                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Review & save</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start text-sm text-gray-500">
                                <span className="w-6"><MapPin className="w-4 h-4" /></span> {/* Using plus as generic marker/icon */}
                                <span className="font-medium text-gray-900">{trip.location || 'No location'}</span>
                            </div>
                            <div className="flex items-start text-sm text-gray-500">
                                <span className="w-6"><Calendar className="w-4 h-4" /></span>
                                <span>{trip.startDate || 'Start'} - {trip.endDate || 'End'}</span>
                            </div>
                            <div className="flex items-start text-sm text-gray-500">
                                <span className="w-6"><Check className="w-4 h-4" /></span>
                                <span>{trip.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                            <div className="flex items-start text-sm text-gray-500">
                                <span className="w-6"><Calendar className="w-4 h-4" /></span>
                                <span>{trip.days?.length || 0} day(s)</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-colors text-sm ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? 'Saving...' : 'Save trip'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

            </main>

            {/* Lightbox Overlay */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeLightbox}>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>

                        {/* Previous Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }}
                            className={`absolute left-0 lg:-left-12 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all ${selectedPhoto.index === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <img
                            src={selectedPhoto.url}
                            alt="Full screen"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />

                        {/* Next Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }}
                            className={`absolute right-0 lg:-right-12 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all ${(() => {
                                const day = trip.days.find(d => d.id === selectedPhoto.dayId);
                                const stop = day?.stops.find(s => s.id === selectedPhoto.stopId);
                                return stop && selectedPhoto.index === stop.photos.length - 1;
                            })() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <div className="absolute -bottom-10 left-0 right-0 text-center text-white/80 text-sm font-medium">
                            {(() => {
                                const day = trip.days.find(d => d.id === selectedPhoto.dayId);
                                const stop = day?.stops.find(s => s.id === selectedPhoto.stopId);
                                return stop ? `${selectedPhoto.index + 1} / ${stop.photos.length}` : '';
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripEditor;
