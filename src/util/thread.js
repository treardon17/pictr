// const { spawn } = require('threads')
const { job, start, stop } = require('microjob')

class ThreadManager {
  // static run(func, params = {}, { onExit } = {}) {
  //   return new Promise((resolve, reject) => {
  //     const thread = spawn(func)
  //     thread.send({ ...params, __dirname })
  //       .on('message', (response) => {
  //         resolve(response)
  //         thread.kill()
  //       })
  //       .on('error', (error) => {
  //         reject(error)
  //         thread.kill()
  //       })
  //       .on('exit', () => {
  //         typeof onExit === 'function' && onExit()
  //       })
  //   })
  // }
  static async run(func, params = {}, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        await start()
        const res = await job(func, params)
        resolve(res)
      } catch (err) {
        reject(err)
      } finally {
        await stop()
      }
    })
  }
}

module.exports = ThreadManager
