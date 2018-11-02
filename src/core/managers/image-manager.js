const Util = require('../../util')
const TRImage = require('../image')

class ImageManager {
  async imagesInFolder({ src, chunk = 500, depth = -1, fullPath = true, type = 'image' }) {
    return new Promise(async (resolve, reject) => {
      try {
        let images = await Util.FileIO.getFilesInDirectory({
          src,
          type,
          fullPath,
          depth
        })
        if (chunk != null) images = Util.ArrayUtil.chunk({ array: images, size: chunk })
        resolve(images)
      } catch (err) {
        reject(err)
      }
    })
  }

  async createImages({ src, chunk = 500, depth = -1, fullPath = true, type = 'image' }) {
    return new Promise(async (resolve, reject) => {
      /* eslint-disable */
      Util.Thread.run(({ __dirname, ...input }) => new Promise((resolve, reject) => {
        const path = require('path')
        const Util = require(path.resolve(`${__dirname}/../../util/index.js`))
        Util.FileIO.getFilesInDirectory(input).then(resolve).catch(reject)
      }), { src, chunk, depth, fullPath, type }).then((files) => {
        resolve(files)
      }).catch((err) => {
        reject(err)
      })
      /* eslint-enable */
    })
  }

  async checkDups({ src, src2, depth = -1, fullPath = true, type = 'image' }) {
    if (!src2) src2 = src // eslint-disable-line
    return new Promise(async (resolve, reject) => {
      try {
        const images1 = await Util.FileIO.getFilesInDirectory({
          src,
          type,
          fullPath,
          depth
        })

        const images2 = await Util.FileIO.getFilesInDirectory({
          src: src2,
          type,
          fullPath,
          depth
        })

        const cache = {}
        const duplicates = {}
        const observed = new Set()
        console.log(`Images1: ${images1.length} images`)
        console.log(`Images2: ${images2.length} images`)

        const getCachedImage = async imgPath => new Promise(async (resolve, reject) => { // eslint-disable-line
          let image
          if (cache[imgPath]) image = cache[imgPath]
          else {
            image = new TRImage({ path: imgPath })
            await image.updateImageData()
            cache[imgPath] = image
          }
          resolve(image)
        })

        for (let img1Index = 0; img1Index < images1.length; img1Index += 1) {
          const img1Path = images1[img1Index]
          console.log(`Checking: ${img1Path}`)
          const image1 = await getCachedImage(img1Path)

          for (let img2Index = 0; img2Index < images2.length; img2Index += 1) {
            const img2Path = images2[img2Index]
            // make sure we're not looking at the exact same image
            if (img1Path !== img2Path && !observed.has(img1Path) && !observed.has(img2Path)) {
              console.log(`   ${img1Index + 1}/${images1.length} -- ${img2Index + 1}/${images2.length} Compare: ${img2Path}`)
              const image2 = await getCachedImage(img2Path)
              const duplicate = await image1.checkDuplicate({ image: image2 })
              if (duplicate.match > 0.9) {
                if (!duplicates[img1Path]) duplicates[img1Path] = []
                const duplicateItem = duplicates[img1Path]
                duplicateItem.push(img2Path)
                observed.add(img2Path)
                delete cache[img2Path]
                await Util.FileIO.writeFile({ src: '@/data/file-data/duplicates.json', data: duplicates })
              }
            }
          }
          delete cache[img1Path]
          observed.add(img1Path)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = new ImageManager()
