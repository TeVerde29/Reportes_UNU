const requireSession = (req, res, next) => {
    if (!req.session || !req.session.auth) {
        return res.status(401).json({
        success: false,
        message: 'No autenticado'
        });
    }
    next();
};

module.exports = requireSession;
