const fs = require('fs')
const moment = require('moment')

fs.readFile(process.argv[2], (error, data) => {
  if (error) {
    console.log(error)
    return
  }
  const output = []
  const rows = data.toString().split('\n')

  //The first row is always metadata, remove
  rows.shift()
  rows.forEach(row => {
    //Remove multiple spaces
    if (row.length < 15) {
      return
    }
    row = row.replace(/\s\s+/g, ' ')
    row = row.split(' ')
    const date = moment(row[2].substr(0, 8), 'YYYYMMDD')
    date.set('hour', 0)
    if (row[2].substr(-1, 1) === '2') {
      date.set('hour', 12)
    }
    for (let i = 0; i < 12; i++) {
      //Levels are in mm, convert to meters
      const level = row[i + 3] / 1000
      output.push(`${date.unix()}, ${level}`)
      date.add(1, 'hour')
    }
  })
  if (output.length) {
    console.log('Writing file')
    fs.writeFile(process.argv[3], output.join('\n'), (error, data) => {
      if (error) {
        console.log(error)
        return
      }
      console.log('Done')
    })
  } else {
    console.log('No rows found')
  }
})
