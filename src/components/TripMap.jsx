import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

// Create numbered icon for markers
const createNumberedIcon = (number) => {
    return L.divIcon({
        className: 'custom-numbered-marker',
        html: `
            <div style="
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                color: white;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${number}</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

// Component to handle bounds updating
const MapBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

// Custom zoom controls component
const CustomZoomControl = () => {
    const map = useMap();

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    return (
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1">
            <button
                onClick={handleZoomIn}
                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4 text-gray-700" />
            </button>
            <button
                onClick={handleZoomOut}
                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4 text-gray-700" />
            </button>
        </div>
    );
};

const TripMap = ({ trip }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapContainerRef = useRef(null);

    // 1. Extract all valid coordinates from stops with sequential numbering
    // memoize to prevent re-calculations and map re-renders
    // 1. Extract all valid coordinates from stops with sequential numbering
    // memoize to prevent re-calculations and map re-renders
    const stopsWithCoords = useMemo(() => {
        let stopNumber = 0;
        return trip?.days?.flatMap(day =>
            day.stops?.filter(stop => stop.coordinates?.lat && stop.coordinates?.lng)
                .map(stop => {
                    stopNumber++;
                    return {
                        ...stop,
                        number: stopNumber,
                        dayDate: day.date,
                        dayTitle: day.title
                    };
                })
        ) || [];
    }, [trip]);

    // Create a stable hash of coordinates to prevent unnecessary re-renders of the map bounds
    // This is crucial: if we only depend on 'trip', any change to trip (like titles) would
    // recreate the positions array, triggering MapBounds to re-fit (auto-zoom).
    const coordinatesHash = useMemo(() => {
        return JSON.stringify(trip?.days?.map(d => d.stops?.map(s => ({
            lat: s.coordinates?.lat,
            lng: s.coordinates?.lng
        }))));
    }, [trip]);

    // Derived positions array - stable reference thanks to coordinatesHash
    // We intentionally ignore linter warning about 'stopsWithCoords' dependency because
    // we want positions to only update when coordinates actually change.
    const positions = useMemo(() =>
        stopsWithCoords.map(stop => [stop.coordinates.lat, stop.coordinates.lng]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [coordinatesHash]);

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (mapContainerRef.current?.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
            } else if (mapContainerRef.current?.webkitRequestFullscreen) {
                mapContainerRef.current.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    if (stopsWithCoords.length === 0) {
        // Fallback or empty state
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
            {/* Fullscreen toggle button */}
            <button
                onClick={toggleFullscreen}
                className="absolute top-3 right-3 z-[1000] w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            >
                {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-gray-700" />
                ) : (
                    <Maximize2 className="w-4 h-4 text-gray-700" />
                )}
            </button>

            <MapContainer
                center={positions[0]}
                zoom={13}
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full z-0"
            >
                {/* 
                    Using CartoDB Voyager tiles for a cleaner, modern look map style.
                    Alternatives: 
                    - 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' (Positron - very light/clean)
                    - 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' (Voyager - colorful but clean)
                */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Custom Zoom Controls */}
                <CustomZoomControl />

                {/* Auto-zoom to fit markers - controlled via memoized bounds to prevent auto-pan loop */}
                <MapBounds bounds={positions} />

                {/* Numbered Markers */}
                {stopsWithCoords.map((stop, idx) => (
                    <Marker
                        key={`${stop.id}-${idx}`}
                        position={[stop.coordinates.lat, stop.coordinates.lng]}
                        icon={createNumberedIcon(stop.number)}
                    >
                        <Popup autoPan={true} autoPanPadding={[50, 50]}>
                            <div className="p-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">{stop.number}</span>
                                    <h3 className="font-bold text-sm">{stop.title}</h3>
                                </div>
                                <p className="text-xs text-gray-500">{stop.dayTitle || stop.dayDate}</p>
                                {stop.desc && <p className="text-xs mt-1 line-clamp-2">{stop.desc}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Route Line */}
                <Polyline
                    positions={positions}
                    color="#6366f1"
                    weight={4}
                    opacity={0.8}
                    dashArray="10, 10"
                    lineCap="round"
                    lineJoin="round"
                />
            </MapContainer>
        </div>
    );
};

export default TripMap;
