import { useState, useEffect } from 'react';
import { Send, Trash2, Reply, MessageCircle } from 'lucide-react';
import { useTrips } from '../store/useStore';
import api from '../services/api';

const CommentItem = ({ comment, tripId, onReply, onDelete }) => {
    const { user } = useTrips();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');

    const isOwner = user && (user._id === comment.user._id || user.id === comment.user._id);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        if (!name) return 'bg-gradient-to-br from-indigo-500 to-purple-600';
        const colors = [
            'bg-gradient-to-br from-blue-500 to-cyan-600',
            'bg-gradient-to-br from-indigo-500 to-purple-600',
            'bg-gradient-to-br from-pink-500 to-rose-600',
            'bg-gradient-to-br from-orange-500 to-red-600',
            'bg-gradient-to-br from-green-500 to-emerald-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const handleReplySubmit = () => {
        if (replyText.trim()) {
            onReply(comment._id, replyText);
            setReplyText('');
            setShowReplyInput(false);
        }
    };

    return (
        <div className="mb-4">
            <div className="flex gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(comment.user.fullName || comment.user.username)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {getInitials(comment.user.fullName || comment.user.username)}
                </div>

                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                            {comment.user.fullName || comment.user.username}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                        </span>
                    </div>

                    {/* Comment Text */}
                    <p className="text-gray-700 text-sm mb-2">{comment.text}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                            <Reply className="w-3 h-3" />
                            Reply
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => onDelete(comment._id)}
                                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {showReplyInput && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                            />
                            <button
                                onClick={handleReplySubmit}
                                disabled={!replyText.trim()}
                                className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
                            {comment.replies.map((reply) => (
                                <div key={reply._id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(reply.user.fullName || reply.user.username)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                        {getInitials(reply.user.fullName || reply.user.username)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 text-sm">
                                                {reply.user.fullName || reply.user.username}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatTimeAgo(reply.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{reply.text}</p>
                                        {user && (user._id === reply.user._id || user.id === reply.user._id) && (
                                            <button
                                                onClick={() => onDelete(reply._id)}
                                                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 mt-1 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentSection = ({ tripId }) => {
    const { user } = useTrips();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch comments on mount
    useEffect(() => {
        fetchComments();
    }, [tripId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/trips/${tripId}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Fetch comments error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || submitting) return;

        try {
            setSubmitting(true);
            const res = await api.post(`/trips/${tripId}/comments`, { text: newComment });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Add comment error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (commentId, text) => {
        try {
            const res = await api.post(`/trips/${tripId}/comments/${commentId}/reply`, { text });

            // Add reply to the parent comment
            setComments(comments.map(c => {
                if (c._id === commentId) {
                    return { ...c, replies: [...(c.replies || []), res.data] };
                }
                return c;
            }));
        } catch (err) {
            console.error('Reply error:', err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await api.delete(`/trips/${tripId}/comments/${commentId}`);

            // Remove comment or reply from state
            setComments(comments.filter(c => c._id !== commentId).map(c => ({
                ...c,
                replies: (c.replies || []).filter(r => r._id !== commentId)
            })));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments
                {comments.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">({comments.length})</span>
                )}
            </h3>

            {/* Add Comment */}
            {user && (
                <div className="flex gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(user.fullName || user.username || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || submitting}
                            className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Post</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            tripId={tripId}
                            onReply={handleReply}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
