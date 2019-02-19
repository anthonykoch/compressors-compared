'use strict'

const fs = require('fs')

const flatten = require('flatten')
const ssim = require('ssim.js/dist/ssim.js')
const escapeStringRegexp = require('escape-string-regexp')
const table = require('markdown-table')


const isFilenameFromChunk = exports.isFilenameFromChunk = (chunkname, filename) => {
  return new RegExp(
      `${
        escapeStringRegexp(`${chunkname}`)
      }\\.\\[.+?\\]\\.(?:jpe?g|png)$`
    ).test(filename)
}

const getChunksFromFiles = exports.getChunksFromFiles = (
  chunknames,
  filenames,
  predicate = isFilenameFromChunk,
) => {
  return filenames.reduce((chunks, filename) => {
    for (const name of chunknames) {
      if (predicate(name, filename)) {
        chunks[name] = Array.isArray(chunks[name]) ? chunks[name] : []
        chunks[name].push(filename)
      }
    }

    return chunks
  }, {})
}

const toHtmlTable = exports.toHtmlTable = (chunks) => {
  const chunkRows =
    chunks.map(({ items, original, image }) => {
      if (original == null) {
        throw new Error('Could not find original for ' + image)
      }
      
      const html =
  `      <tr>
          <td>Original</td>
          <td>${original.size.toFixed(0)} KB</td>
          <td>N/A</td>
        </tr>\n`
        +
        items
          .filter((item) => item.compressor !== 'original')
          .map(({ size, compressor, ssim }, index, arr) => {
            return (
  `      <tr>
          <td>${compressor}</td>
          <td>${size.toFixed(0)} KB</td>
          <td>${ssim.toFixed(4)}</td>
        </tr>${index === arr.length -1 ? '' : '\n'}`
  )
          }).join('')

      return {
        image,
        html,
      }
    })

  const html = chunkRows.map((rows) => {
    return (
    `
    ### ${rows.image}

      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>SSIM</th>
        </tr>
      </thead>
      <tbody>
  ${rows.html}
      </tbody>\n\n
    `
    )
  }).join('')

  return html
}

const toAsciiTable = exports.toAsciiTable = (chunks) => {
  const headings = ['Name', 'Size', 'ssim']

  return chunks.map((chunk) => ({
    table: table([
      headings, 
      ...chunk.items.map(({ size, compressor, ssim }) => {
        return [size, compressor, ssim.toFixed(8)]
      })
    ]),
    ...chunk,
  }))
}

/**
 * @param {Object} chunks
 * @param {string[]} originals
 */
const generate = exports.generate = async (
  chunks, 
  originals, { 
    onChunk,
    output = 'html', 
  } = {},
) => {
  const allFilesLength = flatten(Object.values(chunks)).length
  let completed = 0
    
  const promises =
    Object.entries(chunks)
      .map(async ([chunkname, filenames]) => {
        const original =
          originals.find(filename => isFilenameFromChunk(chunkname, filename))

        if (original == null) {
          throw new Error(`Could not find original for chunk ${chunkname}`)
        }

        const originalInfo = {
          filename: original,
          size: (fs.statSync(original).size / 1000),
        }

        const items = []

        for (const filename of filenames) {
          const { mssim } = await ssim(original, filename)
          
          const item = {
            original: originalInfo,
            filename,
            ssim: mssim,
            compressor: filename.match(/.\[(.+)+\]\./)[1],
            size: (fs.statSync(filename).size / 1000),
          }

          items.push(item)
          completed += 1
          
          if (onChunk) {
            onChunk(item, completed, allFilesLength)
          }
        }

        return {
          items:
          items.sort((a, b) => {
            return a.compressor.localeCompare(b.compressor, 'en', { sensitivity: 'base' })
          }),
          image: chunkname,
          original: originalInfo,
        }
      })

  const datas = await Promise.all(promises).catch(err => {
    console.log(err);
    process.exit(1)
  })

  // console.log(require('util').inspect(datas, { depth: 20 }))
  
  return output === 'html' ? toHtmlTable(datas) : toAsciiTable(datas)
}

process.on('uncaughtException', console.log)
process.on('unhandledRejection', console.log)
