const {VK, Keyboard, MessageContext, Context} = require('vk-io')
const config = require('./config.json')
const { HearManager } = require('@vk-io/hear')
const { QuestionManager } = require('vk-io-question')
const fs = require('fs')
const vk = new VK({token: ''})

const hearManager = new HearManager('<MessageContext>')
const questionManager = new QuestionManager()

vk.updates.use(questionManager.middleware)
vk.updates.on('message_new', hearManager.middleware)

const users = require('./users.json')

const startKeyboard = Keyboard.keyboard([
  [
    Keyboard.textButton({
      label: "Начать",
      color: Keyboard.POSITIVE_COLOR
    }),
    Keyboard.textButton({
      label: 'Профиль',
      color: Keyboard.NEGATIVE_COLOR
    })
  ],
  [
    Keyboard.textButton({
      label: 'Тест',
      color: Keyboard.PRIMARY_COLOR
    }),
    Keyboard.textButton({
      label: 'Тест 2',
      color: Keyboard.SECONDARY_COLOR
    }),
  ]
])

hearManager.hear(/^Начать/i, async(next, context) => {
  console.log(123)
  const user = users.filter(x => x.id === next.senderId)[0]
  if(next.senderId < 0) return;
  if(user) return context()

  const [user_info] = await vk.api.users.get({user_id: next.senderId, fields: 'sex'})

  users.push({
    id: next.senderId,
    firstName: user_info.first_name,
    lastName: user_info.last_name,
    gender: user_info.sex,
    adm: 0,
    balance: 0,
    ban: 0
  })
  return context()
})

hearManager.hear(/^Начать/i, async(context, next) => {
  console.log(1)
  let user = users.filter(x => x.id === context.senderId)[0]
  if(!user) {
    console.log("ошибка нет пользователя")
    return;
  }
  if(user.ban !== 0) {
    console.log('бан')
    return context.send('Вы заблокированы')
  }
  context.send({ message: `Здравствуйте,\n\n Ты ${user.firstName} ${user.lastName} \nТвой баланс составляет ${user.balance} `, keyboard: startKeyboard })
})


hearManager.hear(/^Тест/i, async(context, next) => {
  console.log('тест')
  let user = users.filter(x => x.id === context.senderId)[0]
  if(!user) {
    console.log("ошибка нет пользователя")
    return;
  }
  if(user.ban !== 0) {
    console.log('бан')
    return context.send('Вы заблокированы')
  }
  context.send({ message: `Тест 123 тест`, keyboard: startKeyboard })
})

setInterval(async() => {
  fs.writeFileSync("./users.json", JSON.stringify(users, null, "\t"))
  }, 1000);

vk.updates.start();