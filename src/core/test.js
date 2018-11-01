const ImageManager = require('./managers/image-manager')

ImageManager.createImages({ src: '@/images' }).then((result) => {
  console.log('result:', result)
}).catch((error) => {
  console.log('error:', error)
})
