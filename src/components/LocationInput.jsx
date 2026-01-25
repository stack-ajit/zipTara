import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { searchLocation } from '../services/geocoding';

const LocationInput = ({ value, onChange, onSelect, placeholder = "Search location...", className = "" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);
    const wrapperRef = useRef(null);

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

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue); // Propagate text change immediately

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (newValue.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Debounce search
        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchLocation(newValue);
            setSuggestions(results);
            setIsSearching(false);
            if (results.length > 0) setShowSuggestions(true);
        }, 800);
    };

    const handleSelect = (place) => {
        // Use first part of name for brevity in the input
        const shortName = place.displayName.split(',')[0];

        // Call parent handlers
        onSelect({
            title: shortName,
            coordinates: { lat: place.lat, lng: place.lng },
            fullLocation: place.displayName
        });

        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    className={`w-full ${className}`}
                    value={value}
                    onChange={handleInputChange}
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {suggestions.map((place, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelect(place)}
                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm border-b border-gray-50 last:border-0 flex items-start"
                        >
                            <MapPin className="w-3.5 h-3.5 mt-0.5 mr-2 text-indigo-500 shrink-0" />
                            <span className="text-gray-700 truncate">{place.displayName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationInput;
