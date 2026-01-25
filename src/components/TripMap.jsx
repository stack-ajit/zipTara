import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet integer icon issue
// delete L.Icon.Default.prototype._getIconUrl;

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

const TripMap = ({ trip }) => {
    // 1. Extract all valid coordinates from stops
    const stopsWithCoords = trip?.days?.flatMap(day =>
        day.stops?.filter(stop => stop.coordinates?.lat && stop.coordinates?.lng)
            .map(stop => ({
                ...stop,
                dayDate: day.date,
                dayTitle: day.title
            }))
    ) || [];

    // Also include main trip location if available (as a starting point or marker)
    // const mainLocation = trip.coordinates?.lat ? trip.coordinates : null;

    if (stopsWithCoords.length === 0) {
        // Fallback or empty state
        return (
            <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 rounded-xl p-4 text-center">
                <p>No locations mapped yet.</p>
                <p className="text-xs mt-2 opacity-60">
                    Debug: found {stopsWithCoords.length} valid coordinates in {trip?.days?.length || 0} days.
                </p>
            </div>
        );
    }

    const positions = stopsWithCoords.map(stop => [stop.coordinates.lat, stop.coordinates.lng]);

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 z-0">
            <MapContainer
                center={positions[0]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Auto-zoom to fit markers */}
                <MapBounds bounds={positions} />

                {/* Markers */}
                {stopsWithCoords.map((stop, idx) => (
                    <Marker key={`${stop.id}-${idx}`} position={[stop.coordinates.lat, stop.coordinates.lng]}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm">{stop.title}</h3>
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
