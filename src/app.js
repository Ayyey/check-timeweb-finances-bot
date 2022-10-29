const TelegramApi = require('node-telegram-bot-api')
const config = require("../config.json")
const api = require('./api')
const messageHandlers = require('./messageHandlers')
const NotificationSender = require('./NotificationSender')
const UserChat = require('./UserChat')
const UserChatManager = require('./UserChatManager')

const telegramToken = config.telegram.token
const commands = [
    { command: '/menu', description: 'Показать меню' }
]

const bot = new TelegramApi(telegramToken, { polling: true })
bot.setMyCommands(commands)

const chatManager = new UserChatManager();
const notificationSender = new NotificationSender(bot);
const notificationChecksInterval = 1000
const notificationCheck = () => {
    const chats = chatManager.chats;
    for (const chat of chats) {
        notificationSender.checkNotifications(chat);
    }
}
const interval = setInterval(notificationCheck, notificationChecksInterval)


bot.on('message', async msg => {
    const chatId = msg.chat.id
    const text = msg.text;
    if (!chatManager.isChatExist(chatId)) {
        chatManager.addChatById(chatId)
    }
    try {
        const currentChat = chatManager.getChat(chatId);
        if (text === '/start' || text === '/menu') {
            currentChat.messageHandler = messageHandlers.chatStartHandler
        }
        currentChat.messageHandler(msg, currentChat, bot)
    }
    catch (err) {
        console.log('Error inside on message has occured')
        console.log(err)
        bot.sendMessage(chatId, 'Произошла непредвиденная ошибка! попробуйте перезапустить чат командой /menu')
    }

})

bot.on('callback_query', msg => {
    const chatId = msg.message.chat.id
    const text = msg.data;

    try {
        const currentChat = chatManager.getChat(chatId);
        currentChat.messageHandler(msg, currentChat, bot)
    }
    catch (err) {
        console.log('Error inside callback query has occured')
        console.log(err)
        bot.sendMessage(chatId, 'Произошла непредвиденная ошибка! попробуйте перезапустить чат командой /start')
    }
})

bot.on('polling_error', (err) => { console.log('Polling error: '); console.log(err) })