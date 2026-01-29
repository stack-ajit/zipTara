const Comment = require('../models/Comment');
const Trip = require('../models/Trip');

// Get all comments for a trip
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ trip: req.params.id })
            .populate('user', 'username fullName')
            .sort({ createdAt: -1 });

        // Organize into parent comments and replies
        const parentComments = comments.filter(c => !c.parentComment);
        const replies = comments.filter(c => c.parentComment);

        // Attach replies to their parent comments
        const commentsWithReplies = parentComments.map(parent => {
            const parentReplies = replies.filter(r =>
                r.parentComment.toString() === parent._id.toString()
            );
            return {
                ...parent.toObject(),
                replies: parentReplies
            };
        });

        res.json(commentsWithReplies);
    } catch (err) {
        console.error("Get Comments Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// Add a new comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ msg: 'Comment text is required' });
        }

        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }

        const newComment = new Comment({
            trip: req.params.id,
            user: req.user.id,
            text: text.trim()
        });

        const comment = await newComment.save();
        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'username fullName');

        res.json({ ...populatedComment.toObject(), replies: [] });
    } catch (err) {
        console.error("Add Comment Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// Reply to a comment
exports.replyToComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ msg: 'Reply text is required' });
        }

        const parentComment = await Comment.findById(req.params.commentId);
        if (!parentComment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        const newReply = new Comment({
            trip: req.params.id,
            user: req.user.id,
            text: text.trim(),
            parentComment: req.params.commentId
        });

        const reply = await newReply.save();
        const populatedReply = await Comment.findById(reply._id)
            .populate('user', 'username fullName');

        res.json(populatedReply);
    } catch (err) {
        console.error("Reply Comment Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentComment: req.params.commentId });

        // Delete the comment itself
        await Comment.findByIdAndRemove(req.params.commentId);

        res.json({ msg: 'Comment removed' });
    } catch (err) {
        console.error("Delete Comment Error:", err.message);
        res.status(500).send('Server Error');
    }
};
