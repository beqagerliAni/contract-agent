import axios from "axios";

export const WebHookClient = axios.create({
    headers: {
        'x-make-apikey': process.env.WEBHOOK_APY_KEY
    },
    baseURL: 'https://hook.us2.make.com/'
})