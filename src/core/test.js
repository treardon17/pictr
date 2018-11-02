const ImageManager = require('./managers/image-manager')

ImageManager.createImages({ src: '/Users/tylerreardon/Developer/Projects/RockRabbit/pictr' }).then((result) => {
  console.log('result:', result)
}).catch((error) => {
  console.log('error:', error)
})
