const axios = require('axios')
module.exports = {
    async fetchFinances(token) {
        const response = await axios({
            method: "get",
            url: "https://public-api.timeweb.com/api/v1/accounts/finances",
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        return response.data.finances
    },
    async fetchAuthorizationToken(login,password){
        const response = await axios({
            method: "post",
            url: "https://public-api.timeweb.com/api/v2/auth",
            headers: {
                'Content-type': 'application/json',
                'authorization': 'Basic ' + Buffer.from(login+':'+password).toString('base64')
            },
        })
        return response.data
    }
}
