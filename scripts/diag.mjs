import { chromium } from 'playwright'

const url = process.argv[2] || 'https://skylarhillebrant.github.io/skylartracker/'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text()))
page.on('pageerror', (e) => console.log('PAGEERROR', e.message, '\n', e.stack?.slice(0, 400)))
page.on('requestfailed', (r) => console.log('REQFAIL', r.url(), r.failure()?.errorText))

try {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 })
} catch (e) {
  console.log('GOTO_ERROR', e.message)
}
await page.waitForTimeout(4000)
const appLen = await page.$eval('#app', (el) => el.innerHTML.length).catch(() => 'NO #app')
const bodyText = await page.$eval('body', (el) => el.innerText.slice(0, 300)).catch(() => '')
console.log('APP_HTML_LEN', appLen)
console.log('BODY_TEXT', JSON.stringify(bodyText))
await browser.close()
