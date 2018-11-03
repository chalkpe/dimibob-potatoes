const util = require('./util')
const cheerio = require('cheerio')

const words = ['감자', '포테이토', '포테토']
const meals = ['조식', '중식', '석식', '간식']

const parse = $ => (i, e) => {
  const [k, v] = $(e).text().split(':').map(v => v.trim())
  return meals.includes(k) && v.split(/[*/&]/).map(v => v.trim())
}

const filter = menu =>
  menu && words.some(w => menu.includes(w))

module.exports = async function parseArticle (article) {
  const html = await util.fetch(article.href, 'document_srl')
  if (words.every(w => !html.includes(w))) return []

  const $ = cheerio.load(html)
  return $('div.xe_content p').map(parse($)).get().filter(filter)
}