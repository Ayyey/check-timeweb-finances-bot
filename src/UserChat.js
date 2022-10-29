const Account = require("./Account")
const api = require("./api")
const messageHandlers = require('./messageHandlers')
module.exports = class UserChat {
    constructor(id) {
        this.id = id
        this.accounts = []
        this.messageHandler = messageHandlers.chatStartHandler;
        this.notificationHour = 8;
        this.notificationMinute = 0;
    }
    async fetchFinances(accountLogin) {
        const account = this.accounts.find((account, index) => { return account.login === accountLogin })
        return account.getFinances()
    }
    async addAccount(login, password) {
        try {
            const acc = new Account(this)
            await acc.authentificate(login, password)
            this.accounts.push(acc);
            return true;
        }
        catch (err) {
            console.error('Ошибка при добавлении аккаунта!')
            return false
        }
    }
    async removeAccount(login) {
        let isDeleted = false;
        this.accounts = this.accounts.filter((account, index) => {
            if (account.login === login) isDeleted = true;
            return account.login !== login
        })
        return isDeleted;
    }
    getAccountsLogins() {
        const res = this.accounts.map((account, index) => { return account.login });
        return res
    }
    getAccount(login) {
        const res = this.accounts.find((account) => { return account.login === login });
        if (res)
            return res
        else throw new Error('account not found')
    }
    updateNotificationHour(hours, minutes) {
        this.notificationHour = hours
        this.notificationMinute = minutes;
        this.accounts = this.accounts.map((account) => {
            if (account.notificationTime) {
                const date = new Date(account.notificationTime);
                date.setHours(hours)
                date.setMinutes(minutes)
                account.notificationTime = date.getTime();
            }
        })
    }
}
