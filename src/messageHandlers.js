const chatCommands = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: 'Добавить аккаунт', callback_data: 'add account' }, { text: 'Удалить аккаунт', callback_data: 'del account' }],
            [{ text: 'Включить уведомления', callback_data: 'enable notifications' }, { text: 'Отключить уведомления', callback_data: 'disable notifications' }],
            [{ text: 'Настроить время уведомления', callback_data: 'configure notifications' }],
            [{ text: 'Тестовое уведомление', callback_data: 'test' }]
        ]
    })
}
const markupAccounts = (userChat) => {
    const accounts = userChat.getAccountsLogins();
    const markup = [];
    for (let i = 0; i < accounts.length;) {
        const line = []
        line.push({ text: accounts[i], callback_data: accounts[i] })
        i++;
        if (i < accounts.length) {
            line.push({ text: accounts[i], callback_data: accounts[i] })
            i++;
        }
        markup.push(line);
    }
    return {
        reply_markup: JSON.stringify({
            inline_keyboard: markup
        })
    }
}
const sendMenu = async (msg, userChat, bot) => {
    await bot.sendMessage(userChat.id, 'Выберите действие:', chatCommands)
    userChat.messageHandler = module.exports.chatCommandHandler
}
const messageHandlers = {
    chatStartHandler(msg, userChat, bot) {
        bot.sendMessage(msg.chat.id, 'Приветствую!' +
            " На текущий момент вы можете:\n\
        Добавлять аккаунты в систему;\n\
        Включать уведомления для аккаунтов;\n\
        Отключать уведомления для аккаунтов;\n\
        Настраивать время уведомления.")
        sendMenu(msg, userChat, bot);
    },
    async chatCommandHandler(msg, userChat, bot) {
        const data = msg.data;
        const chatId = userChat.id
        switch (data) {
            case 'add account':
                await bot.sendMessage(chatId, 'Введите логин и пароль через пробел');
                userChat.messageHandler = messageHandlers.chatLoginHandler;
                break;
            case 'del account':
                if (userChat.accounts.length > 0) {
                    await bot.sendMessage(chatId, 'Выберите аккаунт', markupAccounts(userChat))
                    userChat.messageHandler = messageHandlers.chatDeleteHandler
                }
                else {
                    await bot.sendMessage(chatId, 'Не выполнен вход ни в один аккаунт!')
                    sendMenu(msg, userChat, bot)
                }
                break;
            case 'enable notifications':
                if (userChat.accounts.length > 0) {
                    await bot.sendMessage(chatId, 'Выберите аккаунт', markupAccounts(userChat))
                    userChat.messageHandler = messageHandlers.chatNotificationEnableHandler
                }
                else {
                    await bot.sendMessage(chatId, 'Не выполнен вход ни в один аккаунт!')
                    sendMenu(msg, userChat, bot)
                }
                break;
            case 'disable notifications':
                if (userChat.accounts.length > 0) {
                    await bot.sendMessage(chatId, 'Выберите аккаунт', markupAccounts(userChat))
                    userChat.messageHandler = messageHandlers.chatNotificationDisableHandler
                }
                else {
                    await bot.sendMessage(chatId, 'Не выполнен вход ни в один аккаунт!')
                    sendMenu(msg, userChat, bot)
                }
                break;
            case 'configure notifications':
                await bot.sendMessage(chatId, 'Введите время в формате ЧЧ:ММ когда будут приходить уведомления');
                userChat.messageHandler = messageHandlers.chatDateHandler;
                break;
            case 'test':
                for (const account of userChat.accounts) {
                    const newNotificationDate = new Date();
                    newNotificationDate.setMinutes(userChat.notificationMinute);
                    newNotificationDate.setHours(userChat.notificationHour)
                    newNotificationDate.setSeconds(0);
                    account.notificationTime = account.notificationTime < newNotificationDate.getTime() ?
                        newNotificationDate.getTime() + 1000 * 60 * 60 * 24 :
                        newNotificationDate.getTime()
                }
                sendMenu(msg, userChat, bot);
                break;
        }
    },
    async chatLoginHandler(msg, userChat, bot) {
        try {
            const loginData = msg.text.split(' ');
            if (loginData.length != 2) {
                await bot.sendMessage(msg.chat.id, "Ошибка ввода, попробуйте еще раз");
                sendMenu(msg, userChat, bot);
            }
            else if (await userChat.addAccount(loginData[0], loginData[1])) {
                await bot.sendMessage(msg.chat.id, "Вход успешен!")
                sendMenu(msg, userChat, bot);
            }
            else {
                throw new Error('login error')
            }
        }
        catch (err) {
            console.log('error has occured')
            console.log(err)
            await bot.sendMessage(msg.chat.id, "Произошла ошибка входа! Возможно вы неправильно ввели логин или пароль");
            sendMenu(msg, userChat, bot);
        }
    },
    async chatDeleteHandler(msg, userChat, bot) {
        if (userChat.removeAccount(msg.data)) {
            await bot.sendMessage(userChat.id, "Аккаунт успешно удален!");
            sendMenu(msg, userChat, bot)
        }
    },
    async chatNotificationEnableHandler(msg, userChat, bot) {
        const acc = userChat.getAccount(msg.data);
        acc.createNotification(0);
        sendMenu(msg, userChat, bot);
    },
    async chatNotificationDisableHandler(msg, userChat, bot) {
        const acc = userChat.getAccount(msg.data);
        acc.disableNotification();
        await bot.sendMessage(userChat.id, 'Уведомления отключены');
        sendMenu(msg, userChat, bot);
    },
    async chatDateHandler(msg, userChat, bot) {
        const text = msg.text
        const timeData = text.split(':');
        if (timeData.length != 2) {
            await bot.sendMessage(msg.chat.id, "Ошибка ввода, попробуйте еще раз");
            sendMenu(msg, userChat, bot);
        }
        else if (timeData[0] >= 0 && timeData[0] <= 24 && timeData[1] >= 0 && timeData[1] <= 60) {
            userChat.notificationHour = timeData[0];
            userChat.notificationMinute = timeData[1];
            await bot.sendMessage(msg.chat.id, "Успешно!");
            sendMenu(msg, userChat, bot);
        }
        else {
            await bot.sendMessage(msg.chat.id, "Ошибка ввода, попробуйте еще раз");
            sendMenu(msg, userChat, bot);
        }
    },
}
module.exports = messageHandlers