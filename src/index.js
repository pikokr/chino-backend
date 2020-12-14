const express = require('express')
const config = require('../config.json')
const path = require("path");
const fs = require("fs");

const app = express()

function register(dir, route='/') {
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
