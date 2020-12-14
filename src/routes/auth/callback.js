const fetch = require('node-fetch')
const config = require('../../../config.json')
const safeFetch = require("../../util/safeFetch");
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
        if (res.error) return res.redirect(config.frontend)
        const tokenData = {}
        tokenData.token = response
        response = await safeFetch('https://discord.com/api/v8/users/@me', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `${response.token_type} ${response.access_token}`
            }
        })
        if (response.message) return res.redirect(config.frontend)
        tokenData.user = response
        const token = jwt.sign(tokenData, config.jwt)
        res.redirect(config.frontend + '/auth/callback?token=' + token)
    }
}