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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-full md:w-[260px] cursor-pointer group"
        >
            {/* Image Card */}
            <div
                className="relative h-[280px] md:h-[240px] rounded-2xl overflow-hidden mb-3"
                onClick={handleCardClick}
            >
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

                {/* Top Actions */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    {/* Author Badge */}
                    <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                        <span className="text-white/90 text-xs font-medium">by {authorName}</span>
                    </div>

                    {/* Bookmark */}
                    <button
                        onClick={handleToggleSave}
                        className={`p-2 rounded-full backdrop-blur-md transition-all ${isSaved
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                            }`}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    {/* Location */}
                    <div className="flex items-center text-white/70 text-xs font-medium mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{trip.location}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">
                        {trip.title}
                    </h3>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
                </div>
            </div>

            {/* Stats Footer - Below Card */}
            <div className="flex items-center justify-between px-1">
                {/* Date Info */}
                <span className="text-gray-500 text-sm">
                    {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {trip.days?.length || Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1)} days
                </span>

                {/* Comment & Star */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trip/${trip.id || trip._id}#comments`);
                        }}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{trip.commentsCount || 0}</span>
                    </button>
                    <button
                        onClick={handleToggleStar}
                        className={`flex items-center gap-1.5 transition-colors ${isStarred ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                    >
                        <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{trip.stars?.length || 0}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PosterCard;
