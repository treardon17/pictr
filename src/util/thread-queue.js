const ThreadManager = require('./thread')

class ThreadQueue {
  constructor({ concurrent = 10, tasks = [] } = {}) {
    this.concurrent = concurrent
    this.tasks = tasks
  }

  getTaskChunk() {
    const numTasks = this.concurrent > this.tasks ? this.tasks.length : this.concurrent
    return this.tasks.splice(0, numTasks)
  }

  async runChunk() {
    return new Promise(async (resolve, reject) => {
      if (this.tasks.length === 0) resolve()
      try {
        const taskChunk = this.getTaskChunk()
        const values = await Promise.all(taskChunk.map((task) => {
          const { func, params, options } = task
          console.log(func, params, options)
          return ThreadManager.run(func, params, options)
        }))
        console.log('after promise.all', values)
        resolve(values)
      } catch (err) {
        reject(err)
      }
    })
  }

  async run() {
    return new Promise(async (resolve, reject) => {
      const values = []
      try {
        while (this.tasks.length > 0) {
          const chunkValues = await this.runChunk()
          console.log('chunk values', chunkValues)
          values.push(...chunkValues)
        }
        resolve(values)
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = ThreadQueue
