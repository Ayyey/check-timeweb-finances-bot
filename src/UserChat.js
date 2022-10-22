const Account = require("./Account")
const api = require("./api")
const messageHandlers = require('./messageHandlers')
module.exports = class UserChat {
    constructor(id) {
        this.id = id
        this.accounts = []
        this.messageHandler = messageHandlers.chatStartHandler;
    }
    async fetchFinances(accountLogin) {
        const account = this.accounts.find((account,index)=>{return account.login === accountLogin})
        return account.getFinances()
    }
    async addAccount(login, password) {
        try {
            const acc = new Account()
            await acc.authentificate(login, password)
            this.accounts.push(acc);
        }
        catch (err) {
            console.error('Ошибка при добавлении аккаунта!')
            throw new Error('cannot add account!')
        }
    }
    async removeAccount(login) {
        this.accounts.filter((account, index)=>{return account.login !== login})
    }
    getAccountsLogins(){
        return this.accounts.map((account, index)=>{return account.login})
    }
}
