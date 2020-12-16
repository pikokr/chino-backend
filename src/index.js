const express = require('express')
const config = require('../config.json')
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken')
const safeFetch = require("./util/safeFetch");
const fetch = require('node-fetch')
const cors = require('cors')

const app = express()

app.use(cors())

app.use(async (req, res, next) => {
    let user
    try {
        if (!req.headers.authorization) return
        const data = jwt.verify(req.headers.authorization, config.jwt)
        req.token = data
        let newToken
        if (data.expiresAt < Date.now()) {
            const result = await fetch('https://discord.com/api/v8/oauth2/token', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                body: new URLSearchParams({
                    client_id: config.oauth.clientID,
                    grant_type: 'refresh_token',
                    client_secret: config.oauth.clientSecret,
                    redirect_uri: config.oauth.redirectURL,
                    refresh_token: data.refresh_token,
                    scope: 'identify guilds'
                })
            })
            if (result.status !== 200) {
                return
            }
            const token = await result.json()

            req.token = token

            newToken = jwt.sign(token, config.jwt)
        }

        user = await safeFetch('https://discord.com/api/v8/users/@me', {
            headers: newToken ? {
                Authorization: `${newToken.token_type} ${newToken.access_token}`
            } : {
                Authorization: `${data.token_type} ${data.access_token}`
            }
        })

        console.log(user)

        if (newToken) {
            user.newToken = newToken
        }

    } catch (e) {
        user = null
    } finally {
        req.user = user
        next()
    }
})

function register(dir, route = '/') {
    const items = fs.readdirSync(dir)
    for (const item of items) {
        if (fs.lstatSync(path.join(dir, item)).isDirectory()) {
            register(path.join(dir, item), route === '/' ? route + item : route + '/' + item)
        } else {
            const mod = require(path.join(dir, item))
            if (item === 'index.js') {
                Object.keys(mod).forEach(it => {
                    app[it](route, mod[it])
                })
            } else {
                Object.keys(mod).forEach(it => {
                    app[it](route + (route === '/' ? '' : '/') + item.slice(0, item.length - 3), mod[it])
                })
            }
        }
    }
}

register(path.join(__dirname, 'routes'))

app.listen(config.port)
