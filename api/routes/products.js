const express = require("express")
const router = express.Router()
const webhook = require("../discordApi")
const undici = require("undici");
const {loadImage, createCanvas} = require("canvas");
const fs = require("fs");
let embedUrl = "hi"
router.post('/', (req, res, next) =>{

    const username = req.headers.username
    const password = req.headers.password

    const fs = require("fs")
    const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"

    const undici = require("undici")
    const funcaptcha = require("funcaptcha")
    const readline = require("readline")
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    function ask(question) {
        return new Promise((resolve, reject) => {
            rl.question(question, (answer) => {
                resolve(answer)
            })
        })
    }

    let csrf = "";

    async function sendRequest(challengeId, fieldData, token) {
        const headers = {
            "x-csrf-token": csrf,
            "content-type": "application/json",
            "user-agent": USER_AGENT,
            'rblx-challenge-type': 'captcha',
            origin: "https://www.roblox.com",
            referer: "https://www.roblox.com/"
        }

        if (fieldData) {
            headers['rblx-challenge-metadata'] = Buffer.from(JSON.stringify({
                unifiedCaptchaId: fieldData.unifiedCaptchaId,
                captchaToken: token.token,
                actionType: fieldData.actionType,
            })).toString('base64')
        }

        if (challengeId) {
            headers['rblx-challenge-id'] = challengeId
        }

        const res3 = await undici.request("https://auth.roblox.com/v2/login", {
            method: "POST",
            headers,
            body: JSON.stringify({
                "ctype": "Username",
                "cvalue": username,
                "password": password,
            })
        })

        const newCsrf = res3.headers['x-csrf-token']

        if (newCsrf) {
            csrf = newCsrf
            return sendRequest(challengeId, fieldData, token)
        }

        const body = await res3.body.json()
        console.log('BODY', body)
        return { body, headers: res3.headers }
    }

    sendRequest().then(async ({ headers }) => {
        setTimeout(async () => {
            const fieldData = JSON.parse(Buffer.from(headers["rblx-challenge-metadata"], "base64"))

            const token = await funcaptcha.getToken({
                pkey: "476068BF-9607-4799-B53D-966BE98E2B81",
                surl: "https://roblox-api.arkoselabs.com",
                data: {
                    "blob": fieldData.dataExchangeBlob,
                },
                headers: {
                    "User-Agent": USER_AGENT,
                },
                site: "https://www.roblox.com",
                location: "https://www.roblox.com/login",
            })


            if (!token.token.includes('sup=1')) {
                const session = new funcaptcha.Session(token, {
                    proxy: "http://ieflzcbi:y1a3vlna3v92@64.137.99.50:5683",
                    userAgent: USER_AGENT,
                })

                const challenge = await session.getChallenge().catch((err) => console.log('login fail', err))

                 setTimeout(function(){
                     for(let x = 0; x < challenge.data.game_data.waves; x++) {
                         const { createCanvas, loadImage } = require('canvas');
                          loadImage('api/routes/image.gif').then(async image => {
                             const canvas = createCanvas(image.width, image.height);
                             const context = canvas.getContext('2d');

                             context.drawImage(image, 0, 0);

                             // Convert the image to Base64
                             const base64String = canvas.toDataURL('image/png');

                             fs.writeFileSync('output.png', base64String.split(';base64,').pop(), 'base64');

                             const imgur = await fetch("https://api.imgur.com/3/image", {
                                 method: "POST",
                                 headers: {
                                     Authorization: "Client-ID 0aa1f824fe46e52"
                                 },
                                 body: base64String.split(';base64,').pop()
                             }).then(resp => console.log(resp.json().then(res => console.log(res.data.link))))

                         })}
                 }, 2000)
            } else {
                console.log('Suppressed captcha!')
            }



            sendRequest(headers['rblx-challenge-id'], fieldData, token).then(resa => {

                  res.status(200).json({
                      body: resa.body,
                      headers: resa.headers,
                      webhook: webhook,
                      embed: embedUrl

                  })

            })
        }, 2500)
    })

})

module.exports = router
