const fetch = require('node-fetch')
const config = require('../../../config.json')
const jwt = require('jsonwebtoken')

module.exports = {
    get: async (req, res) => {
        let response = await fetch('https://discord.com/api/v8/oauth2/token', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            body: new URLSearchParams({
                client_id: config.oauth.clientID,
                grant_type: 'authorization_code',
                client_secret: config.oauth.clientSecret,
                redirect_uri: config.oauth.redirectURL,
                code: req.query.code,
                scope: 'identify guilds'
            })
        }).then(res => res.json())
        response.expiresAt = Date.now() + response.expires_in
        if (res.error) return res.redirect(config.frontend)
        const token = jwt.sign(response, config.jwt)
        res.redirect(config.frontend + '/auth/callback?token=' + token)
    }
}