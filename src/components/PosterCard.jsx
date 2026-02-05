import { useNavigate } from 'react-router-dom';
import { MapPin, Bookmark, Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../store/useStore';

const PosterCard = ({ trip }) => {
    const navigate = useNavigate();
    const { user, toggleSaved, toggleStar } = useTrips();

    const isSaved = user?.savedTrips?.includes(trip.id || trip._id);
    const currentUserId = user?._id || user?.id;
    const isStarred = trip.stars?.includes(currentUserId);

    // Get author name
    const authorName = typeof trip.user === 'object'
        ? (trip.user.username || trip.user.fullName || 'Unknown')
        : 'Unknown';

    const handleCardClick = () => {
        navigate(`/trip/${trip.id || trip._id}`);
    };

    const handleToggleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(trip.id || trip._id);
    };

    const handleToggleStar = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleStar(trip.id || trip._id);
    };

    // Calculate days
    const days = trip.days?.length || Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-full md:w-[260px] cursor-pointer group"
            onClick={handleCardClick}
        >
            {/* Card Container with white background for mobile */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm md:shadow-none md:bg-transparent">
                {/* Image Section */}
                <div className="relative h-[200px] md:h-[240px] overflow-hidden md:rounded-2xl">
                    {/* Background Image */}
                    {trip.cover ? (
                        <img
                            src={trip.cover}
                            alt={trip.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    )}

                    {/* Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Bookmark Button */}
                    <button
                        onClick={handleToggleSave}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${isSaved
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white'
                            }`}
                    >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    {/* Bottom Content on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        {/* Location */}
                        <div className="flex items-center text-white/80 text-xs font-medium mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{trip.location}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">
                            {trip.title}
                        </h3>
                    </div>
                </div>

                {/* White Card Section - Mobile */}
                <div className="p-4 md:p-0 md:pt-3">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-2 md:mb-0">
                        {/* Date */}
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                            </svg>
                            <span>{new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                        </div>

                        {/* Star and Comment */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleToggleStar}
                                className={`flex items-center gap-1 transition-colors ${isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                            >
                                <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                                <span className="text-sm">{trip.stars?.length || 0}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/trip/${trip.id || trip._id}#comments`);
                                }}
                                className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm">{trip.commentsCount || 0}</span>
                            </button>
                        </div>
                    </div>

                    {/* Author */}
                    <p className="text-gray-500 text-sm mb-1">by {authorName}</p>

                    {/* Duration */}
                    <p className="text-gray-400 text-sm">{days} {days === 1 ? 'day' : 'days'}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default PosterCard;
