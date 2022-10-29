const sequelize = require('sequelize')
const UserChat = require('./UserChat')
module.exports = class UserChatManager {
    constructor() {
        this.chats = [];
    }
    addChatById(chatId) {
        if (!this.isChatExist(chatId)) {
            const chat = new UserChat(chatId)
            this.chats.push(chat)
        }
        else throw new Error('Chat with this id is exist')
    }
    getChat(chatId) {
        if (this.isChatExist(chatId)) {
            const chat = this.chats.find(element => element.id === chatId)
            return chat
        }
        else throw new Error('Chat doesn\'t exist')
    }
    isChatExist(chatId) {
        const chat = this.chats.find(element => element.id === chatId)
        if (chat)
            return true
        return false
    }
}