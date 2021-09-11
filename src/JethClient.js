const { Client, Collection } = require('discord.js')
const { readdir } = require('fs')
module.exports = class JethClient extends Client {
  constructor(options) {
    super(options)

    this.aliases = new Collection()
    this.commands = new Collection()
  }

  registerCommand() {
    readdir(`${__dirname}/commands`, (err, files) => {
      if (err) console.log(err.message)
      files.forEach((category) => {
        readdir(`${__dirname}/commands/${category}`, (err, cmd) => {
          if (err) console.log(err.message)
          const Command = require(`${__dirname}/commands/${category}/${cmd}`)
          const command = new Command()
          this.commands.set(command.config.name, command)
          command.config.aliases.forEach((alias) => this.aliases.set(alias, command.config.name))
        })
      })
    })
  }

  registerListener() {
    readdir(`${__dirname}/listeners`, (err, files) => {
      if (err) return new Error(err.name)
      files.forEach((category_or_folder) => {
        if (category_or_folder.endsWith('.js')) {
          const Events = require(`${__dirname}/listeners/${category_or_folder}`)
          const events = new Events()
          super.on(events.name, (...args) => events.exec(this, ...args))
        } else {
          readdir(`${__dirname}/listeners/${category_or_folder}`, (error, file) => {
            const Events = require(`${__dirname}/listeners/${category_or_folder}/${file}`)
            const events = new Events()
            super.on(events.name, (...args) => events.exec(this, ...args))
          })
        }
      })
    })
  }

  start(token) {
    this.registerCommand()
    this.registerListener()
    super.login(token)
  }
}