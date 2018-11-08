// const ImageManager = require('./managers/image-manager')
const Util = require('../util')
// console.log(process.env)

// ImageManager.createImages({ src: '/Users/tylerreardon/Developer/Projects/RockRabbit/pictr' }).then((result) => {
//   console.log('result:', result)
// }).catch((error) => {
//   console.log('error:', error)
// })
/* eslint-disable */
const tasks = []
for (let i = 0; i < 100; i += 1) {
  const task = {
    func: async (params) => {
      return await new Promise((resolve) => setTimeout(() => {
        resolve(params.test)
      }, 500))
    },
    params: { test: i }
  }
  tasks.push(task)
}
const start = new Date()
const concurrent = 5
const queue = new Util.ThreadQueue({ concurrent, tasks })
queue.run().then(() => {
  // console.log(queue.results)
  const end = new Date()
  console.log(`${concurrent} threads doing ${tasks.length} tasks:`, `${(end - start) / 1000}s`)
}).catch((err) => {
  console.log(err)
})
