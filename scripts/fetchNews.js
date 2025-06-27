import fs from 'fs/promises'
import https from 'https'
import Parser from 'rss-parser'

// 1) Tell rss-parser to capture <media:content> into item.mediaContent
const parser = new Parser({
  customFields: {
    item: [
      // ['xmlTagName', 'jsPropertyName']
      ['media:content', 'mediaContent']
    ]
  }
})

function fetchXML(urlString) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString)
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: { 'User-Agent': 'Node.js RSS reader' }
    }

    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${urlString}`))
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

function sanitizeXML(xml) {
  // escape stray ampersands
  return xml.replace(
    /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[a-fA-F0-9]+;)/g,
    '&amp;'
  )
}

async function fetchAndSanitizeFeed(url) {
  try {
    const xml  = sanitizeXML(await fetchXML(url))
    const feed = await parser.parseString(xml)
    return feed
  } catch (err) {
    throw new Error(`Failed to fetch/parse ${url}: ${err.message}`)
  }
}

async function fetchAndSaveNews() {
  const feedUrls = [
    'https://www.lapresse.ca/manchettes/rss',
    'https://ici.radio-canada.ca/rss/4159',
    'https://www.journaldemontreal.com/rss.xml',
    'https://www.tvanouvelles.ca/rss.xml'
  ]

  let news = []

  for (const url of feedUrls) {
    try {
      const feed = await fetchAndSanitizeFeed(url)

      let rawSource = feed.title || new URL(url).hostname
      let source = rawSource
      if (/radio-canada/i.test(rawSource)) {
        source = 'Radio-Canada'
      } else if (/lapresse\.ca|la presse/i.test(rawSource)) {
        source = 'La Presse'
      } else {
        source = rawSource.split(/\s*[-|]\s*/)[0]
      }
      const items = feed.items.map(item => ({
        title:       item.title,
        link:        item.link,
        pubDate:     item.pubDate,
        description: item.contentSnippet || item.description || '',
        image:       item.enclosure?.url
                    || item.mediaContent?.$?.url
                    || null,
        author:      item.creator || item.author || null,
        source
      }))

      news = news.concat(items)
    } catch (err) {
      console.error(err.message)
    }
  }

  // newest first
  news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

  await fs.writeFile(
    './assets/json/news.json',
    JSON.stringify(news, null, 2),
    'utf8'
  )
  console.log('✅ News saved to assets/json/news.json')
}

fetchAndSaveNews()
