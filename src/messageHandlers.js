const UserChat = require('./UserChat') 
const UserChatManager = require('./UserChatManager')
module.exports = {
    async chatStartHandler(msg, userChat){
        return 'Приветствую!' + 
        "На текущий момент вы можете:\n\
        использовать команду /login\n\
        Получить информацию о состоянии счета\n\
        Получить информацию об оставшемся времени аренды\n"
    },
    async chatCommandHandler(msg, userChat){
        const text = msg.text
        if(text == '/login'){
            userChat.messageHandler = this.chatLoginHandler
            return 'Введите логин и пароль через 1 пробел'
        }
        else if(text == '/balance'){
            
        }
        else if(text == '/duration'){
            
        }
    },
    async chatLoginHandler(msg, userChat){

    },
    async chatDateHandler(msg, userChat){

    }
}