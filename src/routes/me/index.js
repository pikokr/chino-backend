module.exports = {
    get: (req,res) => {
        if (!req.user) return res.status(401).json({code: 401, error: 'Unauthorized'})
        res.json(req.user)
    }
}