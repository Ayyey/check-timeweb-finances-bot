module.exports = class NotificationSender {
    constructor(bot) {
        this.bot = bot;
    }
    checkNotifications(userChat) {
        const accounts = userChat.accounts;
        const now = new Date().getTime();
        for (const account of accounts) {
            if (account.notificationTime <= now && account.enableNotifications) {
                this.sendNotification(userChat, account);
            }
        }
    }
    async sendNotification(userChat, account) {
        try {
            const fin = await account.getFinances();

            const daysLeft = Math.floor(fin.balance / (fin.hourly_cost * 24));
            const balance = fin.balance.toString().substring(0, fin.balance.toString().indexOf('.') + 3)
            const shutDownDate = new Date(new Date().getTime() + (fin.balance / fin.hourly_cost * 60 * 60 * 1000))

            let isNotificationNeeded = true;
            let nextNotificationTime;
            if (daysLeft > 30) {
                isNotificationNeeded = true;
                nextNotificationTime = shutDownDate.getTime() - new Date(1000 * 60 * 60 * 24 * 30)
            }
            else if (daysLeft == 30) {
                nextNotificationTime = new Date().getTime() + 1000 * 60 * 60 * 24 * 14 //14 days in millisecs
            }
            else if (daysLeft > 16 && daysLeft < 30) {
                nextNotificationTime = new Date().getTime() + 1000 * 60 * 60 * 24 * (daysLeft - 16) //time until 16 days left
            }
            else if (daysLeft <= 16) {
                nextNotificationTime = new Date().getTime() + 1000 * 60 * 60 * 24 * 2 //2 days
            }

            const nextNotificationDate = new Date(nextNotificationTime);
            nextNotificationDate.setHours(userChat.notificationHour);
            nextNotificationDate.setMinutes(userChat.notificationMinute)
            account.notificationTime = nextNotificationDate.getTime();

            let msg;
            if (daysLeft > 0) {
                msg = 'Оплата хостинга ' + account.login + ' на сумму ' + fin.monthly_cost + fin.currency +
                    '.\nХостинг отключится ' + shutDownDate.getDate() + '.' + (shutDownDate.getMonth() + 1) +
                    '.\nНа хостинге сейчас ' + balance + fin.currency +
                    '.\nДней до отключения осталось ' + daysLeft +
                    '.\nДата следующего оповещения ' + nextNotificationDate.getDate() + '.' + (nextNotificationDate.getMonth() + 1) + '.'
            }
            else {
                msg = 'Оплата хостинга ' + account.login + ' на сумму ' + fin.monthly_cost + fin.currency +
                    '.\nНа аккаунте не осталось средств!' +
                    '\nДата следующего оповещения ' + nextNotificationDate.getDate() + '.' + (nextNotificationDate.getMonth() + 1) + '.';
            }
            if (isNotificationNeeded)
                this.bot.sendMessage(userChat.id, msg);
        }
        catch (error) {
            console.log(error)
            throw new Error('Could not send notification because of above error');
        }
    }
}