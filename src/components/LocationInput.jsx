import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';

const LIBRARIES = ['places', 'marker'];

const LocationInput = ({ value, onChange, onSelect, placeholder = "Search location...", className = "" }) => {
    // We specify the 'v: beta' or 'v: weekly' to ensure the new Places API is available
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
        version: 'weekly'
    });

    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (newValue.length < 3 || !isLoaded) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Dynamically import the required classes for the New Places API
                const { AutocompleteSuggestion } = await window.google.maps.importLibrary("places");

                const request = { input: newValue };
                const { suggestions: fetchResults } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

                if (fetchResults && fetchResults.length > 0) {
                    setSuggestions(fetchResults);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error("Autocomplete Error:", error);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleSelect = async (suggestion) => {
        // Use the place prediction if available
        const placePrediction = suggestion.placePrediction;
        if (!placePrediction) return;

        setIsSearching(true);
        try {
            // The toPlace() method creates a Place object representing the prediction
            const place = placePrediction.toPlace();

            // We must explicitly fetch the fields we need from the new Places API
            await place.fetchFields({ fields: ['displayName', 'location', 'formattedAddress'] });

            if (place.location) {
                onSelect({
                    title: place.displayName || placePrediction.mainText.text,
                    coordinates: {
                        lat: place.location.lat(),
                        lng: place.location.lng()
                    },
                    fullLocation: place.formattedAddress
                });
                setShowSuggestions(false);
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Place selection error:", error);
        } finally {
            setIsSearching(false);
        }
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
                    disabled={!isLoaded}
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                )}
            </div>

            {showSuggestions && (
                <div className="absolute z-[2000] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => {
                        const pred = suggestion.placePrediction;
                        if (!pred) return null; // Skip non-place queries gracefully

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm border-b border-gray-50 last:border-0 flex items-start transition-colors"
                            >
                                <MapPin className="w-4 h-4 mt-0.5 mr-3 text-indigo-500 shrink-0" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-gray-900 font-medium truncate">
                                        {pred.mainText?.text}
                                    </span>
                                    <span className="text-gray-500 text-xs truncate">
                                        {pred.secondaryText?.text}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LocationInput;
