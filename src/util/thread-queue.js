const ThreadManager = require('./thread')

class ThreadQueue {
  constructor({ concurrent = 10, tasks = [] } = {}) {
    this.concurrent = concurrent
    this.tasks = []
    this.currentTasks = []
    this.addTasks(tasks)
  }

  get isFinished() {
    return this.tasks.length === 0 && this.currentTasks.length === 0
  }

  addTasks(tasks = []) {
    if (Array.isArray(tasks)) tasks.forEach((task) => { this.addTask(task) })
  }

  addTask(task = {}) {
    if (task instanceof Object && task.func) {
      this.tasks.push(task)
    } else {
      console.error('Task', task, 'must be an object containing a func: Function, and params: Object')
    }
  }

  getTaskChunk(num) {
    const numTasks = num > this.tasks ? this.tasks.length : num
    return this.tasks.splice(0, numTasks)
  }

  async runChunk(num = this.concurrent) {
    return new Promise(async (resolve, reject) => {
      if (this.tasks.length === 0) resolve()
      try {
        const taskChunk = this.getTaskChunk(num)
        const currentTasks = taskChunk.map((task) => {
          const { func, params, options } = task
          return ThreadManager.run(func, params, { stopPool: false })
        })
        this.currentTasks = currentTasks
        const values = await Promise.all(currentTasks)
        resolve(values)
      } catch (err) {
        reject(err)
      }
    })
  }

  async runAllChunks() {
    return new Promise(async (resolve, reject) => {
      const values = []
      try {
        while (this.tasks.length > 0) {
          const chunkValues = await this.runChunk(this.concurrent)
          values.push(...chunkValues)
        }
        resolve(values)
      } catch (err) {
        reject(err)
      }
    })
  }

  async fillFreeSpaces(onTaskComplete, onTaskError) {
    return new Promise((resolve, reject) => {
      const numFreeSpaces = this.concurrent - this.currentTasks.length
      const toRun = this.getTaskChunk(numFreeSpaces)
      this.currentTasks.push(...toRun)
      let finishCount = 0
      toRun.forEach((task) => {
        const { func, params, options } = task
        ThreadManager.run(func, params, { stopPool: false })
          .then((value) => {
            if (typeof onTaskComplete === 'function') onTaskComplete(task, value)
          })
          .catch((err) => {
            if (typeof onTaskError === 'function') onTaskError(task, value)
          })
          .finally(() => {
            finishCount += 1
            if (finishCount === toRun.length) {
              resolve()
            }
          })
      })
      return numFreeSpaces
    })
  }

  async runAsNeeded() {
    return new Promise(async (resolve, reject) => {
      const values = []
      try {
        this.fillFreeSpaces(async (task, value) => {
          const indexOfTask = this.currentTasks.indexOf(task)
          this.currentTasks.splice(indexOfTask, 1)
          values.push(value)
          this.runAsNeeded()
            .then((valuesNext) => {
              values.push(...valuesNext)
              console.log('values next', valuesNext)
              resolve(values)
            })
        }).then(() => {
          console.log('then', values)
          if (this.isFinished) {
            resolve(values)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async run() {
    return new Promise(async (resolve, reject) => {
      try {
        await ThreadManager.startWorkerPool()
        const values = await this.runAsNeeded()
        await ThreadManager.stopWorkerPool()
        resolve(values)
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = ThreadQueue
