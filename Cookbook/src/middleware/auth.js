function isAuthenticated(req, res, next) {
    if (req.session && req.session.username) { 
        return next();
    }else{
        res.redirect('/login')
    }
}

module.exports = isAuthenticated;