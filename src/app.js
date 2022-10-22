const TelegramApi = require('node-telegram-bot-api')
const config = require("../config.json")
const api = require('./api')
const UserChat = require('./UserChat')

const telegramToken = config.telegram.token

async function meme(){
    const uc = new UserChat(123);
    await uc.addAccount('cn49670','NnProOZns4bn');
    const fin = await uc.fetchFinances('cn49670')
    console.log(fin)
}
meme();

