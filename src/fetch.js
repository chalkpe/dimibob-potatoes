const util = require('./util')
const axios = require('axios')
const cheerio = require('cheerio')

const load = (page = 1) => axios
  .get('https://www.dimigo.hs.kr/index.php', {params: {mid: 'school_cafeteria', page}})
  .then(res => cheerio.load(res.data))

const parse = $ => ({
  list: $('#dimigo_post_cell_2 tr').map(parseCell($)).get(),
  total: parseInt(util.query($('a.direction.next').attr('href'), 'page'))
})

const parseCell = $ => (i, e) => ({
  title: $(e).find('td.title').text().trim(),
  date: $(e).find('td.regdate').text().trim(),
  href: $(e).find('td.title a').attr('href')
})

module.exports = async function board () {
  const {list, total} = parse(await load())
  const progress = util.bar('finding articles', total, 1)

  for (let page = 2; page <= total; page++) {
    list.push(...parse(await load(page)).list)
    progress.tick()
  }

  return list
}