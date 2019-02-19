'use strict'

const fs = require('fs')
const path = require('path')

const flatten = require('flatten')
const argv = require('yargs').argv
const glob = require('glob')
const _cliProgress = require('cli-progress')
const getStdin = require('get-stdin')
const ejs = require('ejs')

const { generate, getChunksFromFiles } = require('./size-core')

const onError = (err) => {
  console.log(err)
  process.exit(1)
}

getStdin().then(stdin => {
  const compressedFilenames = 
    glob.sync(path.join(__dirname, '../build/**/*.*'), {
      ignore: ['build/images'],
    })

  const originals = 
    glob.sync(path.join(__dirname, '../build/images/*.*'), {
      ignore: ['build/images'],
    })

  const chunknames = [
    'leaves',
    'workharder',
    // 'pancakes',
    'flowers',
    // 'desk',
    // 'lamp',
  ]

  const bar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic)

  if (argv.outfile == null) {
    throw new Error('Output file not specified')
  }
  
  const outfileOption = 
    path.isAbsolute(argv.outfile)
      ? argv.outfile
      : path.join(process.cwd(), argv.outfile)

  const outfile = outfileOption || path.join(process.cwd(), 'size.html')
  const chunks = getChunksFromFiles(chunknames, compressedFilenames)

  bar.start(flatten(Object.values(chunks)).length, 1)  

  generate(
    chunks,
    originals, {
      output: argv.output || 'html',
      onChunk(_, index) {
        bar.update((index).toFixed(0))
      },
    }
  )
    .then((content) => {
      bar.stop()
      
      const output = stdin.length > 0 ? ejs.render(stdin, { content }) : content

      fs.writeFileSync(outfile, output)
    })
    .catch(onError)
})
.catch(onError)
