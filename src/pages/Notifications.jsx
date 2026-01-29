import { useEffect } from 'react';
import { useTrips } from '../store/useStore';
import Layout from '../components/Layout';
import { Sparkle, MessageCircle, Star, CheckCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Notifications = () => {
    const { notifications, fetchNotifications, markNotificationsRead, unreadCount } = useTrips();
    const navigate = useNavigate();

    // Refresh notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            // Ideally mark single as read, but for now we have bulk read
            // We can implement single read later or just use the bulk one for now
            // markNotificationsRead(); // Or keep it unread until "Mark all" is clicked? 
            // Better to just navigate. The bulk read is global.
        }
        if (notification.trip) {
            const hash = notification.type === 'comment' ? '#comments' : '';
            navigate(`/trip/${notification.trip._id}${hash}`);
        }
    };

    const handleMarkAllRead = () => {
        markNotificationsRead();
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        if (!name) return 'bg-gradient-to-br from-gray-400 to-gray-500';
        const colors = [
            'bg-gradient-to-br from-blue-400 to-blue-600',
            'bg-gradient-to-br from-purple-400 to-purple-600',
            'bg-gradient-to-br from-pink-400 to-pink-600',
            'bg-gradient-to-br from-green-400 to-green-600',
            'bg-gradient-to-br from-yellow-400 to-orange-600',
            'bg-gradient-to-br from-teal-400 to-cyan-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <Sparkle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications yet</h3>
                            <p className="text-gray-500 max-w-sm px-4">
                                When others interact with your trips, you'll see it here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((n) => (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`relative p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!n.read ? 'bg-blue-50/50 hover:bg-blue-50' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    {/* Unread Indicator */}
                                    {!n.read && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}

                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(n.sender?.fullName || n.sender?.username)}`}>
                                        {getInitials(n.sender?.fullName || n.sender?.username)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className="text-slate-900 text-sm leading-relaxed">
                                            <span className="font-bold hover:underline cursor-pointer">
                                                {n.sender?.username || n.sender?.fullName || 'Someone'}
                                            </span>
                                            {n.type === 'star' ? (
                                                <span className="text-gray-600"> gave a <span className="text-yellow-500 font-bold">Tara</span> to </span>
                                            ) : (
                                                <span className="text-gray-600"> commented on </span>
                                            )}
                                            <span className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                                                {n.trip?.title || 'your trip'}
                                            </span>
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            {n.type === 'star' ? (
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            ) : (
                                                <MessageCircle className="w-3 h-3 text-blue-500" />
                                            )}
                                            <span className="text-xs text-gray-400 font-medium">
                                                {getTimeAgo(n.createdAt)} ago
                                            </span>
                                        </div>
                                    </div>

                                    {/* Trip Thumbnail (Optional - if we had it populated) */}
                                    {/* <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                        {n.trip?.cover && <img src={n.trip.cover} alt="" className="w-full h-full object-cover" />}
                                    </div> */}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
