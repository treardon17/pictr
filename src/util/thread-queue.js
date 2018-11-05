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
          return ThreadManager.run(func, params, { stopPool: false })
        }))
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
        await ThreadManager.startWorkerPool()
        while (this.tasks.length > 0) {
          const chunkValues = await this.runChunk()
          values.push(...chunkValues)
        }
        await ThreadManager.stopWorkerPool()
        resolve(values)
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = ThreadQueue
