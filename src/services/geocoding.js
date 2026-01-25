import axios from 'axios';

// OpenStreetMap Nominatim API
// Rate Limit: 1 request per second
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const searchLocation = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const response = await axios.get(NOMINATIM_BASE_URL, {
            params: {
                q: query,
                format: 'json',
                limit: 5,
                addressdetails: 1
            },
            headers: {
                // It is polite to include a User-Agent identify your app
                'User-Agent': 'TravelTrails/1.0'
            }
        });

        return response.data.map(item => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type
        }));
    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
};
