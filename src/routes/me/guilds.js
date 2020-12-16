const safeFetch = require("../../util/safeFetch");
module.exports = {
    get: async (req, res) => {
        if (!req.token || !req.user) return res.status(401).json()

        const guilds = await safeFetch('https://discord.com/api/v8/users/@me/guilds', {
            headers: {
                Authorization: `${req.token.token_type} ${req.token.access_token}`
            }
        })

        console.log(guilds)

        if (!(guilds instanceof Array)) return res.json(guilds)

        res.json(guilds)
    }
}