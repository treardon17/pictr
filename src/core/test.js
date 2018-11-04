// const ImageManager = require('./managers/image-manager')
const Util = require('../util')

// ImageManager.createImages({ src: '/Users/tylerreardon/Developer/Projects/RockRabbit/pictr' }).then((result) => {
//   console.log('result:', result)
// }).catch((error) => {
//   console.log('error:', error)
// })
const tasks = []
for (let i = 0; i < 21; i += 1) {
  const task = {
    func: (params) => {
      console.log('params', params)
      return params.test
    },
    params: { test: i }
  }
  tasks.push(task)
}
const queue = new Util.ThreadQueue({ concurrent: 2, tasks })
queue.run().then((results) => {
  console.log(results)
})
