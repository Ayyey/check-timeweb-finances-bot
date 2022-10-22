const api = require('./api') 
module.exports = class Account{
    constructor(){
    }
    async authentificate(login, password) {
        try {
            const authData = await api.fetchAuthorizationToken(login, password)
            this.expires_in = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) //today + 24 hours
            this.access_token = authData.access_token;
            this.login = login;
            this.password = password;
        }
        catch (err) {
            console.error('Произошла ошибка аутентификации!')
            throw new Error('failed to authentificate!')
        }
    }
    async getFinances(){
        if(this.isAuthentificated()){
            return await api.fetchFinances(this.access_token)
        }
        else this.refreshAuthentification()
        if(this.isAuthentificated()){
            return await api.fetchFinances(this.access_token)
        }
        else throw new Error('cannot get finances: authentification is not possible')
    }
    async refreshAuthentification() {
        let authData = null
        if (this.login && this.password) {
            authData = await api.fetchAuthorizationToken(this.login, this.password)
            this.access_token = authData.access_token
            this.expires_in = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        }
        else throw new Error('Cannot refresh authentification: login or password is missing')
    }
    async isAuthentificated() {
        if (!this.login || !this.password || !this.access_token || (new Date().getTime() >= this.expires_in.getTime())) {
            return false
        }
        return true
    }
}