import { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const [trips, setTrips] = useState([]);
    const [publicTrips, setPublicTrips] = useState([]); // Restored for Home page
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); // Auth loading
    const [tripsLoading, setTripsLoading] = useState(true); // Data loading
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

    // Load User on Mount/Token Change
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    setAuthToken(token); // Ensure api header is set
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error("Load User Error:", err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            // Auth check done, unblock UI
            setLoading(false);

            // Fetch trips in background if user is logged in
            if (token) {
                setTripsLoading(true);
                Promise.all([fetchTrips(), fetchPublicTrips()])
                    .finally(() => setTripsLoading(false));
            } else {
                setTripsLoading(false);
            }
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

    const register = async (username, email, password, fullName, dob) => {
        try {
            const res = await api.post('/auth/register', { username, email, password, fullName, dob });
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

    const googleLogin = async (credential) => {
        try {
            const res = await api.post('/auth/google', { credential });

            if (res.data.isNewUser) {
                setPendingGoogleUser(res.data.googleProfile);
                return { success: true, isNewUser: true };
            }

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            setPendingGoogleUser(null);
            return { success: true, isNewUser: false };
        } catch (err) {
            console.error("Google Login Error:", err.response?.data?.msg);
            setError(err.response?.data?.msg || 'Google login failed');
            return { success: false };
        }
    };

    const googleRegister = async (registrationData) => {
        try {
            const res = await api.post('/auth/google-register', registrationData);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            setPendingGoogleUser(null);
            return true;
        } catch (err) {
            console.error("Google Register Error:", err.response?.data?.msg);
            setError(err.response?.data?.msg || 'Google registration failed');
            return res.data?.msg || false;
        }
    };

    const updateProfile = async (fullName, dob, username) => {
        try {
            const res = await api.put('/auth/profile', { fullName, dob, username });
            setUser(prev => ({ ...prev, ...res.data }));
            return true;
        } catch (err) {
            console.error("Update Profile Error:", err);
            return err.response?.data?.msg || false;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            await api.put('/auth/password', { currentPassword, newPassword });
            return { success: true };
        } catch (err) {
            console.error("Change Password Error:", err);
            return { success: false, msg: err.response?.data?.msg || 'Failed to update password' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setPendingGoogleUser(null);
        setTrips([]);
        setNotifications([]);
        setUnreadCount(0);
    };

    // --- Notification Actions ---

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error('Fetch Notifications Error:', err);
        }
    };

    const markNotificationsRead = async () => {
        try {
            await api.patch('/notifications/read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark Notifications Read Error:', err);
        }
    };

    // Auto-poll notifications every 60 seconds
    // Auto-poll notifications every 5 seconds (Real-time feel)
    useEffect(() => {
        if (!token) return;
        fetchNotifications();

        // CRITICAL: Fetch trips immediately on mount (fixes "0 Trips" bug)
        fetchTrips();
        fetchPublicTrips();

        const notifInterval = setInterval(fetchNotifications, 5000); // 5s for notifications

        // Poll trips data every 10 seconds to update star/comment counts
        const tripsInterval = setInterval(() => {
            fetchTrips(true); // true = background mode (silent refresh)
            fetchPublicTrips(true);
        }, 10000);

        return () => {
            clearInterval(notifInterval);
            clearInterval(tripsInterval);
        };
    }, [token]);

    // --- Trip Actions ---

    // --- Trip Actions ---

    const fetchTrips = async (background = false) => {
        try {
            if (!background) setTripsLoading(true);
            const res = await api.get('/trips');
            const newTrips = res.data.map(t => ({ ...t, id: t._id }));

            // Avoid state update if exact same (optimization can be added later, for now we overwrite)
            setTrips(newTrips);
        } catch (err) {
            console.error("Fetch Trips Error:", err);
        } finally {
            if (!background) setTripsLoading(false);
        }
    };

    const fetchPublicTrips = async (background = false) => {
        try {
            // Note: We don't generally have a 'publicTripsLoading' but we can add one if needed.
            // For now, we just fetch safely.
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
                // headers['Content-Type'] = 'multipart/form-data'; // Let axios set this with boundary
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
                // headers['Content-Type'] = 'multipart/form-data'; // Let axios set this with boundary
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

    const toggleStar = async (id) => {
        if (!user) return;

        // Optimistic Update
        const targetTrip = getTrip(id);
        if (!targetTrip) return;

        // Handle both ID string or object formats just in case
        const userId = user._id || user.id;

        // Ensure stars exists
        const currentStars = targetTrip.stars || [];
        const isStarred = currentStars.some(s => (typeof s === 'object' ? s._id : s) === userId);

        let newStars;
        if (isStarred) {
            newStars = currentStars.filter(s => (typeof s === 'object' ? s._id : s) !== userId);
        } else {
            newStars = [...currentStars, userId];
        }

        // Update local state (trips and publicTrips)
        const updateList = (list) => list.map(t =>
            (t.id === id || t._id === id) ? { ...t, stars: newStars } : t
        );

        setTrips(prev => updateList(prev));
        setPublicTrips(prev => updateList(prev));

        try {
            await api.post(`/trips/${id}/star`);
        } catch (err) {
            console.error("Toggle Star Error:", err);
            // Revert on error could be implemented here by refetching
        }
    };

    const getTrip = (id) => {
        return trips.find(t => t.id === id || t._id === id) ||
            publicTrips.find(t => t.id === id || t._id === id);
    };

    const fetchTrip = async (id) => {
        try {
            // setLoading(true); // Don't trigger global auth loader
            const res = await api.get(`/trips/${id}`);
            const fullTrip = { ...res.data, id: res.data._id };

            // Update the list with the full details so we don't refetch if navigating back and forth within session
            setTrips(prev => {
                if (prev.some(t => t.id === fullTrip.id)) {
                    return prev.map(t => t.id === fullTrip.id ? fullTrip : t);
                }
                // CRITICAL FIX: Don't return [...prev], as it creates a new reference and causes infinite renders for public trips
                return prev;
            });

            return fullTrip;
        } catch (err) {
            console.error("Fetch Single Trip Error:", err);
            return null;
        }
    };

    return (
        <TripContext.Provider value={{
            trips,
            publicTrips,
            loading,
            tripsLoading,
            user,
            error,
            login,
            googleLogin,
            googleRegister,
            register,
            updateProfile,
            changePassword,
            logout,
            pendingGoogleUser,
            addTrip,
            deleteTrip,
            updateTrip,
            getTrip,
            fetchTrip,
            toggleSaved,
            toggleStar,
            notifications,
            unreadCount,
            fetchNotifications,
            markNotificationsRead,
            fetchTrips,
            fetchPublicTrips
        }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrips = () => useContext(TripContext);
