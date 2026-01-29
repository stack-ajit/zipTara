module.exports = function (req, res, next) {
    // 401 Unauthorized vs 403 Forbidden
    // 401 = No identity (checked by auth middleware)
    // 403 = Known identity, but not allowed

    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Generic users cannot perform this action.' });
    }
};
