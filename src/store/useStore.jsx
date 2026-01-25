import { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const [trips, setTrips] = useState([]);
    const [publicTrips, setPublicTrips] = useState([]); // New state for public trips
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load User on Mount/Token Change
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    setAuthToken(token); // Ensure api header is set
                    const res = await api.get('/auth/me');
                    setUser(res.data);

                    // Fetch trips after user is loaded
                    fetchTrips();
                    fetchPublicTrips(); // Also fetch public trips
                } catch (err) {
                    console.error("Load User Error:", err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const setAuthToken = (token) => {
        if (token) {
            api.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete api.defaults.headers.common['x-auth-token'];
        }
    };

    // --- Authentication Actions ---

    const login = async (identifier, password) => {
        try {
            const res = await api.post('/auth/login', { identifier, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return true;
        } catch (err) {
            console.error("Login Error:", err.response?.data?.msg);
            setError(err.response?.data?.msg || 'Login failed');
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await api.post('/auth/register', { username, email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return true;
        } catch (err) {
            console.error("Register Error:", err.response?.data?.msg);
            setError(err.response?.data?.msg || 'Registration failed');
            return false;
        }
    };

    const updateProfile = async (fullName, dob) => {
        try {
            const res = await api.put('/auth/profile', { fullName, dob });
            setUser(prev => ({ ...prev, ...res.data }));
            return true;
        } catch (err) {
            console.error("Update Profile Error:", err);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setTrips([]);
    };

    // --- Trip Actions ---

    const fetchTrips = async () => {
        try {
            const res = await api.get('/trips');
            setTrips(res.data.map(t => ({ ...t, id: t._id })));
        } catch (err) {
            console.error("Fetch Trips Error:", err);
        }
    };

    const fetchPublicTrips = async () => {
        try {
            const res = await api.get('/trips/public');
            setPublicTrips(res.data.map(t => ({ ...t, id: t._id })));
        } catch (err) {
            console.error("Fetch Public Trips Error:", err);
        }
    };

    // Helper: Base64 to Blob
    const dataURLtoBlob = (dataURL) => {
        try {
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        } catch (e) {
            return null;
        }
    };

    const addTrip = async (tripData) => {
        try {
            // Remove temp ID if it exists
            const { id, ...data } = tripData;

            // Convert to FormData if there's a new cover image (Base64)
            let requestData = data;
            const headers = {};

            if (data.cover && data.cover.startsWith('data:')) {
                const formData = new FormData();
                const blob = dataURLtoBlob(data.cover);
                if (blob) {
                    formData.append('cover', blob, 'cover.jpg');
                }

                // Append other fields
                Object.keys(data).forEach(key => {
                    if (key !== 'cover') {
                        if (typeof data[key] === 'object') {
                            formData.append(key, JSON.stringify(data[key]));
                        } else {
                            formData.append(key, data[key]);
                        }
                    }
                });

                requestData = formData;
                headers['Content-Type'] = 'multipart/form-data';
            }

            const res = await api.post('/trips', requestData, { headers });
            const newTrip = { ...res.data, id: res.data._id };
            setTrips(prev => [newTrip, ...prev]);
            return newTrip;
        } catch (err) {
            console.error("Add Trip Error:", err);
            return null;
        }
    };

    const updateTrip = async (updatedTrip) => {
        try {
            // Convert to FormData if there's a new cover image (Base64)
            let requestData = updatedTrip;
            const headers = {};

            if (updatedTrip.cover && updatedTrip.cover.startsWith('data:')) {
                const formData = new FormData();
                const blob = dataURLtoBlob(updatedTrip.cover);
                if (blob) {
                    formData.append('cover', blob, 'cover.jpg');
                }

                // Append other fields
                Object.keys(updatedTrip).forEach(key => {
                    if (key !== 'cover') {
                        if (typeof updatedTrip[key] === 'object') {
                            formData.append(key, JSON.stringify(updatedTrip[key]));
                        } else {
                            formData.append(key, updatedTrip[key]);
                        }
                    }
                });

                requestData = formData;
                headers['Content-Type'] = 'multipart/form-data';
            }

            const res = await api.put(`/trips/${updatedTrip._id || updatedTrip.id}`, requestData, { headers });
            const updated = { ...res.data, id: res.data._id };
            setTrips(prev => prev.map(t => (t._id === updated._id ? updated : t)));
            return updated;
        } catch (err) {
            console.error("Update Trip Error:", err);
            return null;
        }
    };

    const deleteTrip = async (id) => {
        try {
            await api.delete(`/trips/${id}`);
            setTrips(prev => prev.filter(t => t._id !== id && t.id !== id));
        } catch (err) {
            console.error("Delete Trip Error:", err);
        }
    };

    const toggleSaved = async (id) => {
        if (!user) return; // Guard clause

        // 1. Optimistic Update
        const previousSavedTrips = user.savedTrips;
        const isCurrentlySaved = user.savedTrips.includes(id);

        let newSavedTrips;
        if (isCurrentlySaved) {
            newSavedTrips = user.savedTrips.filter(tId => tId !== id);
        } else {
            newSavedTrips = [...user.savedTrips, id];
        }

        // Update User State Immediatey
        setUser({ ...user, savedTrips: newSavedTrips });

        try {
            // 2. Perform API Call
            const res = await api.post(`/trips/${id}/save`);

            // 3. Sync with Server (Optional, but good verification)
            // The optimistic update should match, but if server does logic, we update here.
            setUser({ ...user, savedTrips: res.data });

        } catch (err) {
            console.error("Toggle Save Error:", err);
            // 4. Revert on Error
            setUser({ ...user, savedTrips: previousSavedTrips });
            alert("Failed to save trip. Please try again.");
        }
    };

    const getTrip = (id) => {
        return trips.find(t => t.id === id || t._id === id) ||
            publicTrips.find(t => t.id === id || t._id === id);
    };

    return (
        <TripContext.Provider value={{
            trips,
            publicTrips,
            loading,
            user,
            error,
            login,
            register,
            updateProfile,
            logout,
            addTrip,
            deleteTrip,
            updateTrip,
            getTrip,
            toggleSaved
        }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrips = () => useContext(TripContext);
