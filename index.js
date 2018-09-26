const fs = require('fs')
const url = require('url')
const axios = require('axios')
const cheerio = require('cheerio')

const URL = 'https://www.dimigo.hs.kr/index.php'
const PATTERN = /^(\d+)월.*?(\d+)일.*?식단.*$/
const MEALS = { '조식': 'breakfast', '중식': 'lunch', '석식': 'dinner', '간식': 'snack' }

async function fetchArticles () {
  const articles = []
  const params = { mid: 'school_cafeteria', page: 1 }

  while (true) {
    const res = await axios.get(URL, { params })
    const $ = cheerio.load(res.data)

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

fetchArticles()
  .then(v => JSON.stringify(v, null, 2))
  .then(v => fs.writeFileSync('data.json', v))
  .catch(console.error)
