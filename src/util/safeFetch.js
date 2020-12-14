const fetch = require('node-fetch')

const safeFetch = (url, init) => {
    return new Promise(async resolve => {
        const fetched = await fetch(url, init)
        const json = await fetched.json()
        if (json.retry_after) {
            resolve(new Promise(resolve1 => setTimeout(resolve1, json.retry_after)).then(() => safeFetch(url, init)))
        } else {
            return resolve(json)
        }
    })
}

module.exports = safeFetch
