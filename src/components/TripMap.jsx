import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
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
    let stopNumber = 0;
    const stopsWithCoords = trip?.days?.flatMap(day =>
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

    const positions = stopsWithCoords.map(stop => [stop.coordinates.lat, stop.coordinates.lng]);

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
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Custom Zoom Controls */}
                <CustomZoomControl />

                {/* Auto-zoom to fit markers */}
                <MapBounds bounds={positions} />

                {/* Numbered Markers */}
                {stopsWithCoords.map((stop, idx) => (
                    <Marker
                        key={`${stop.id}-${idx}`}
                        position={[stop.coordinates.lat, stop.coordinates.lng]}
                        icon={createNumberedIcon(stop.number)}
                    >
                        <Popup>
                            <div className="p-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{stop.number}</span>
                                    <h3 className="font-bold text-sm">{stop.title}</h3>
                                </div>
                                <p className="text-xs text-gray-500">{stop.dayTitle || stop.dayDate}</p>
                                {stop.desc && <p className="text-xs mt-1 line-clamp-2">{stop.desc}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Route Line */}
                <Polyline positions={positions} color="#6366f1" weight={4} opacity={0.7} />
            </MapContainer>
        </div>
    );
};

export default TripMap;
