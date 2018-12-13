const util = require('./util')
const fetch = require('./fetch')
const parse = require('./parse')

const found = {}
const filter = article => /^(\d+)월.*?(\d+)일.*?식단.*$/.test(article.title)

async function main () {
  util.prepare()

  const articles = (await fetch()).filter(filter)
  const progress = util.bar('parsing articles', articles.length)

  for (const article of articles) {
    (await parse(article)).forEach(m => (found[m] = 1 + (found[m] || 0)))
    progress.tick({ title: article.title })
  }

  await util.save(found)
}

main().catch(console.error)