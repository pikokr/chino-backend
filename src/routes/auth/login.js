const config = require('../../../config.json')

module.exports = {
    get: (req, res) => {
        res.redirect(`https://discord.com/api/v8/oauth2/authorize?client_id=${config.oauth.clientID}&redirect_uri=${config.oauth.redirectURL}&scope=identify%20guilds&response_type=code&prompt=none`)
    }
}
