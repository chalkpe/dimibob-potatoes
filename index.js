const fs = require('fs')
const url = require('url')
const axios = require('axios')
const cheerio = require('cheerio')

const potato = {}

const URL = 'https://www.dimigo.hs.kr/index.php'
const PATTERN = /^(\d+)월.*?(\d+)일.*?식단.*$/
const MEALS = { '조식': 'breakfast', '중식': 'lunch', '석식': 'dinner', '간식': 'snack' }

async function fetchArticles () {
  const articles = []
  const params = { mid: 'school_cafeteria', page: 1 }

  while (true) {
    const $ = cheerio.load((await axios.get(URL, { params })).data)

    const map = $('#dimigo_post_cell_2 tr').map((i, e) => ({
      title: $(e).find('td.title').text().trim(),
      date: $(e).find('td.regdate').text().trim(),
      href: $(e).find('td.title a').attr('href')
    }))

    const next = $('a.direction.next').attr('href')
    const page = parseInt(url.parse(next, true).query.page)

    articles.push(...map.get())
    if (params.page++ >= page) return articles
  }
}

function cache (href) {
  const i = './cache/' + url.parse(href, true).query.document_srl
  if (fs.existsSync(i)) return fs.readFileSync(i, 'utf8')
  else return axios.get(href).then(({ data }) => [fs.writeFileSync(i, data), data][1])
}

async function parseArticle (article) {
  try {
    const html = await cache(article.href)
    if (!html.includes('감자')) return

    const $ = cheerio.load(html)
    const map = $('div.xe_content p').map((i, e) => {
      const [k, v] = $(e).text().split(':').map(v => v.trim())
      return MEALS[k] && v.split(/[*/&]/).map(v => v.trim())
    })

    map.get().forEach(v => {
      if (!v.includes('감자')) return
      potato[v] = potato[v] || 0
      potato[v] += 1
    })
  } catch (_) { console.log(article.href) }
}

function formatPotatoes () {
  return [...Object.entries(potato)]
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(v => v.join(': '))
    .join('\n')
}

fetchArticles()
  .then(v => v.filter(i => PATTERN.test(i.title)))
  .then(v => Promise.all(v.map(parseArticle)))
  .then(() => fs.writeFileSync('data.txt', formatPotatoes()))
  .catch(e => console.error(e))
