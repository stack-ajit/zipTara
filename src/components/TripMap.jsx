import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Map options for a clean, modern look (similar to CartoDB Voyager)
const mapOptions = {
    mapId: 'DEMO_MAP_ID',
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
};

const LIBRARIES = ['places', 'marker'];

const AdvancedMapMarker = ({ map, position, number, onClick }) => {
    const onClickRef = useRef(onClick);

    useEffect(() => {
        onClickRef.current = onClick;
    }, [onClick]);

    useEffect(() => {
        if (!map || !window.google) return;

        let markerInstance = null;
        let isMounted = true;

        const initMarker = async () => {
            try {
                const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

                if (!isMounted) return;

                const pin = new PinElement({
                    glyph: String(number),
                    background: '#6366f1',
                    borderColor: 'white',
                    glyphColor: 'white'
                });

                markerInstance = new AdvancedMarkerElement({
                    map,
                    position,
                    content: pin.element
                });

                markerInstance.addListener('click', () => {
                    if (onClickRef.current) onClickRef.current();
                });
            } catch (error) {
                console.error("Error creating AdvancedMarker:", error);
            }
        };

        initMarker();

        return () => {
            isMounted = false;
            if (markerInstance) {
                markerInstance.map = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, position.lat, position.lng, number]); // Critical: omit onClick and use primitive coords to prevent flickering

    return null;
};

const TripMap = ({ trip }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    const [map, setMap] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedStop, setSelectedStop] = useState(null);
    const mapContainerRef = useRef(null);

    // 1. Extract all valid coordinates from stops with sequential numbering
    const stopsWithCoords = useMemo(() => {
        let stopNumber = 0;
        return trip?.days?.flatMap(day =>
            day.stops?.filter(stop => stop.coordinates?.lat && stop.coordinates?.lng)
                .map(stop => {
                    stopNumber++;
                    return {
                        ...stop,
                        coords: { lat: parseFloat(stop.coordinates.lat), lng: parseFloat(stop.coordinates.lng) },
                        number: stopNumber,
                        dayDate: day.date,
                        dayTitle: day.title
                    };
                })
        ) || [];
    }, [trip]);

    const positions = useMemo(() =>
        stopsWithCoords.map(stop => stop.coords),
        [stopsWithCoords]);

    // Fit bounds whenever markers change
    useEffect(() => {
        if (map && positions.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            positions.forEach(pos => bounds.extend(pos));
            map.fitBounds(bounds);

            // Padding adjustment if needed
            if (positions.length === 1) {
                map.setZoom(13);
            }
        }
    }, [map, positions]);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (mapContainerRef.current?.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!isLoaded) return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl" />;

    if (stopsWithCoords.length === 0) {
        return (
            <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 rounded-xl p-4 text-center">
                <p>No locations mapped yet.</p>
                <p className="text-xs mt-2 opacity-60">
                    Add stops with locations to see the route on the map.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={mapContainerRef}
            className={`relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 ${isFullscreen ? 'h-screen w-screen' : 'h-[400px] w-full'}`}
        >
            <button
                onClick={toggleFullscreen}
                className="absolute top-3 right-3 z-10 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            >
                {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-gray-700" />
                ) : (
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                )}
            </button>

            <GoogleMap
                mapContainerStyle={containerStyle}
                options={mapOptions}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {/* Route Line */}
                <Polyline
                    path={positions}
                    options={{
                        strokeColor: "#6366f1",
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        icons: [{
                            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                            offset: '0',
                            repeat: '20px'
                        }]
                    }}
                />

                {/* Numbered Markers */}
                {stopsWithCoords.map((stop, idx) => (
                    <AdvancedMapMarker
                        key={`${stop.id}-${idx}`}
                        map={map}
                        position={stop.coords}
                        number={stop.number}
                        onClick={() => setSelectedStop(stop)}
                    />
                ))}

                {selectedStop && (
                    <InfoWindow
                        position={selectedStop.coords}
                        onCloseClick={() => setSelectedStop(null)}
                    >
                        <div className="p-2 min-w-[150px]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                    {selectedStop.number}
                                </span>
                                <h3 className="font-bold text-sm text-gray-900">{selectedStop.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500">{selectedStop.dayTitle || selectedStop.dayDate}</p>
                            {selectedStop.desc && (
                                <p className="text-xs mt-2 text-gray-600 border-t pt-2 line-clamp-2">
                                    {selectedStop.desc}
                                </p>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default TripMap;
