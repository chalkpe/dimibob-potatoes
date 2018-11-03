const fs = require('fs')
const url = require('url')
const path = require('path')
const axios = require('axios')
const progress = require('progress')

const query = (str, name) =>
  url.parse(str, true).query[name]

const prepare = () => fs.mkdirSync('./cache')

function fetch (href, ident) {
  const path = `./cache/${query(href, ident)}.html`
  if (fs.existsSync(path)) return fs.readFileSync(path, 'utf8')
  else return axios.get(href).then(({ data }) => cache(data, path))
}

function cache (value, path) {
  fs.writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value, null, 2))
  return value
}

function save (found) {
  const keys = Object.keys(found).length
  const count = Object.values(found).reduce((a, b) => a + b)
  const out = [...Object.entries(found)]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(v => `[${v[1].toString().padStart(2, '0')}] ${v[0]}`)
    .join('\n')

  fs.writeFileSync('result.txt', out)
  console.log(`found ${keys} unique menu: total ${count} times occured`)
  console.log(`saved ${process.cwd()}${path.sep}result.txt`)
}

const bar = (fmt, total, curr) =>
  new progress(fmt + ' [:bar] :current/:total', {total, complete: '=', incomplete: ' ', width: 50, curr})


module.exports = {query, fetch, bar, save, prepare}