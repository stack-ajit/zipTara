import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { searchLocation } from '../services/geocoding';

const StopForm = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        time: '10:00',
        title: '',
        desc: '',
        cost: 0,
        notes: '',
        coordinates: null
    });

    // Geocoding State
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, title: value }));

        // Clear previous timeout
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (value.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Debounce search
        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchLocation(value);
            setSuggestions(results);
            setIsSearching(false);
            if (results.length > 0) setShowSuggestions(true);
        }, 800);
    };

    const selectSuggestion = (place) => {
        setFormData(prev => ({
            ...prev,
            title: place.displayName.split(',')[0], // Use first part of name for brevity
            coordinates: { lat: place.lat, lng: place.lng }
        }));
        setShowSuggestions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("StopForm Saving:", formData); // DEBUG: Check if coords exist
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-gray-900">
                        {initialData ? 'Edit Stop' : 'Add New Stop'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 relative" ref={wrapperRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Place Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Eiffel Tower"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                    {suggestions.map((place, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => selectSuggestion(place)}
                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm border-b border-gray-50 last:border-0 flex items-start"
                                        >
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 mr-2 text-indigo-500 shrink-0" />
                                            <span className="text-gray-700 truncate">{place.displayName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows="2"
                            placeholder="What will you do here?"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                            value={formData.desc}
                            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Tips</label>
                            <input
                                type="text"
                                placeholder="Bring tickets..."
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col space-y-2">
                        {formData.coordinates && (
                            <p className="text-xs text-green-600 text-center">
                                Location Selected: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                            </p>
                        )}
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-gray-900 text-white py-2 rounded-xl font-medium shadow-md hover:bg-gray-800"
                            >
                                Save Details
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StopForm;
