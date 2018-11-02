const { spawn } = require('threads')

class ThreadManager {
  static run(func, params = {}, { onExit } = {}) {
    return new Promise((resolve, reject) => {
      const thread = spawn(func)
      thread.send({ ...params, __dirname })
        .on('message', (response) => {
          resolve(response)
          thread.kill()
        })
        .on('error', (error) => {
          reject(error)
          thread.kill()
        })
        .on('exit', () => {
          typeof onExit === 'function' && onExit()
        })
    })
  }
}

module.exports = ThreadManager
