'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')
const { getBorderCharacters, table } = require('table')

const files = glob.sync('build/**/*.*')

const chunknames = [
  'leaves',
  'workharder',
  'pancakes',
  'flowers',
  'desk',
  'lamp',
]

const chunked = 
  files.reduce((chunks, filename) => {
    for (const name of chunknames) {
      chunks[name] = Array.isArray(chunks[name]) ? chunks[name] : []
      
      if (filename.includes(name)) {
        chunks[name].push(filename)
      }
    }

    return chunks
  }, {})

const data = 
  Object.entries(chunked)
    .map(([chunkname, filenames]) => {
      
      return filenames.map(filename => [
        `${(fs.statSync(filename).size / 1000).toFixed(0)} kb`,
        path.basename(filename)
      ]).sort((a, b) => a[1] < b[1])
    })

console.log(
  data.map((columns) => 
    table(columns, {
      border: getBorderCharacters('void'),
      columnDefault: {
        paddingLeft: 0,
        paddingRight: 1,
      },
      columns: {
        0: {
          alignment: 'right',
        },
      },
      drawHorizontalLine: () => {
        return false
      },
    })
  ).join('\n')
);

 


// console.log(output);
