// const ImageManager = require('./managers/image-manager')
const Util = require('../util')

// ImageManager.createImages({ src: '/Users/tylerreardon/Developer/Projects/RockRabbit/pictr' }).then((result) => {
//   console.log('result:', result)
// }).catch((error) => {
//   console.log('error:', error)
// })
/* eslint-disable */
const tasks = []
for (let i = 0; i < 9; i += 1) {
  const task = {
    func: (params) => {
      // console.log('params', params)
      return params.test
    },
    params: { test: i }
  }
  tasks.push(task)
}
const queue = new Util.ThreadQueue({ concurrent: 3, tasks })
queue.run().then(() => {
  console.log(queue.results)
}).catch((err) => {
  console.log(err)
})
