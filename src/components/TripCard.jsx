import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, MoreVertical, Trash2, Edit, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useTrips } from '../store/useStore';

const TripCard = ({ trip }) => {
    const navigate = useNavigate();
    const { deleteTrip, user, toggleSaved } = useTrips();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Calculate if saved based on user's savedTrips list
    const isSaved = user?.savedTrips?.includes(trip.id || trip._id);

    // Determine ownership
    let tripUserId = trip.user;
    if (typeof trip.user === 'object' && trip.user !== null) {
        // If it has _id, it's a populated user object. If not, it's likely an ObjectId().
        tripUserId = trip.user._id || trip.user;
    }

    // Convert both to string for comparison
    const currentUserId = user?._id || user?.id;
    const isOwner = user && (tripUserId?.toString() === currentUserId?.toString());

    // Debug ownership (optional, remove in prod)
    // console.log(`Trip: ${trip.title}, IsOwner: ${isOwner}, TripUser: ${tripUserId}, CurrUser: ${currentUserId}`);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this trip?')) {
            deleteTrip(trip.id || trip._id);
        }
        setShowMenu(false);
    };

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card navigation
        navigate(`/trip/${trip.id || trip._id}/edit`);
        setShowMenu(false);
    };

    const handleToggleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(trip.id || trip._id);
    };

    const handleCardClick = (e) => {
        // Prevent navigation if clicking on menu or buttons (handled by stopPropagation, but extra safety)
        navigate(`/trip/${trip.id || trip._id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <div
                onClick={handleCardClick}
                className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
            >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden rounded-t-3xl">
                    {trip.cover ? (
                        <img
                            src={trip.cover}
                            alt={trip.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6 text-center">
                            <span className="text-white/20 font-black text-3xl uppercase tracking-widest">{trip.title?.substring(0, 2) || 'TR'}</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Bookmark Button */}
                    <button
                        onClick={handleToggleSave}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${isSaved
                            ? 'bg-yellow-400 text-white shadow-lg scale-110'
                            : 'bg-white/20 text-white hover:bg-white/40'
                            }`}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center text-xs font-medium opacity-90 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {trip.location}
                        </div>
                        <h3 className="font-bold text-lg leading-tight truncate">{trip.title}</h3>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            {/* Show author if not owner */}
                            {!isOwner && trip.user && (
                                <span className="text-xs text-gray-400">
                                    by {typeof trip.user === 'object' ? (trip.user.username || trip.user.fullName) : 'Unknown'}
                                </span>
                            )}
                        </div>

                        {/* Owner Menu */}
                        {isOwner && (
                            <div className="relative ml-2" ref={menuRef} onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={handleEdit}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                            <Edit className="w-4 h-4 mr-2 text-indigo-500" /> Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                        <span>
                            {trip.days?.length
                                ? trip.days.length
                                : Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1)
                            } days
                        </span>
                        {trip.isPublic && <span className="flex items-center text-indigo-400"><Share2 className="w-3 h-3 mr-1" /> Public</span>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TripCard;
