const ThreadManager = require('./thread')

class ThreadQueue {
  constructor({ concurrent = 10, tasks = [] } = {}) {
    this.totalTaskCount = 0
    this.concurrent = concurrent
    this.tasks = []
    this.currentTasks = []
    this.results = {}
    this.addTasks(tasks)
  }

  get isFinished() {
    return this.tasks.length === 0 && this.currentTasks.length === 0
  }

  addTasks(tasks = []) {
    const taskIDs = []
    if (Array.isArray(tasks)) {
      tasks.forEach((task) => {
        const taskID = this.addTask(task)
        taskIDs.push(taskID)
      })
    }
    return taskIDs
  }

  addTask(task = {}) {
    const taskID = this.totalTaskCount
    task.id = taskID // eslint-disable-line
    this.totalTaskCount += 1
    if (task instanceof Object && task.func) {
      this.tasks.push(task)
    } else {
      console.error('Task', task, 'must be an object containing a func: Function, and params: Object')
    }
    return taskID
  }

  addResults(results) {
    if (Array.isArray(results)) {
      results.forEach((result) => {
        this.addResult(result)
      })
    } else {
      console.error(new Error('`results` must be of type Array'))
    }
  }

  addResult(result) {
    if (result instanceof Object && result._id != null) {
      const { _id, ...rest } = result
      this.results[_id] = rest
    } else {
      console.error(new Error('`result` must be of type Object, and contain an `_id`'))
    }
  }

  getTaskChunk(num) {
    const numTasks = num > this.tasks ? this.tasks.length : num
    return this.tasks.splice(0, numTasks)
  }

  async runChunk(num = this.concurrent) {
    console.log('running chunk', num)
    return new Promise(async (resolve, reject) => {
      if (this.tasks.length === 0) resolve()
      try {
        const parallelIDs = []
        const taskChunk = this.getTaskChunk(num)
        const currentTasks = taskChunk.map((task) => {
          const { func, id, options } = task
          let { params } = task
          if (!params) params = {}
          params._id = id
          parallelIDs.push(id)
          return ThreadManager.run(func, params, { stopPool: false })
        })
        this.currentTasks = currentTasks
        const values = await Promise.all(currentTasks)
        const returnValues = values.map((value, index) => ({ _id: parallelIDs[index], value }))
        resolve(returnValues)
      } catch (err) {
        reject(err)
      }
    })
  }

  async runAllChunks() {
    return new Promise(async (resolve, reject) => {
      try {
        while (this.tasks.length > 0) {
          const chunkValues = await this.runChunk(this.concurrent)
          this.addResults(chunkValues)
        }
        resolve()
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
        const { func, id, options } = task
        let { params } = task
        if (!params) params = {}
        params._id = id
        ThreadManager.run(func, params, { stopPool: false })
          .then((value) => {
            if (typeof onTaskComplete === 'function') onTaskComplete(task, value)
          })
          .catch((err) => {
            if (typeof onTaskError === 'function') onTaskError(task, err)
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
          values.push({ _id: task.id, value })
          this.runAsNeeded()
            .then((valuesNext) => {
              values.push(...valuesNext)
              resolve(values)
            })
        }).then(() => {
          this.addResults(values)
          if (this.isFinished) {
            resolve(values)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async run({ chunk = false } = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        await ThreadManager.startWorkerPool()
        if (chunk) await this.runAllChunks()
        else await this.runAsNeeded()
        await ThreadManager.stopWorkerPool()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = ThreadQueue
