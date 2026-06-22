import { chromium } from 'playwright'

const url = process.argv[2] || 'https://skylarhillebrant.github.io/skylartracker/'
const browser = await chromium.launch()
const page = await browser.newPage()
let errors = 0
page.on('pageerror', (e) => {
  errors++
  console.log('PAGEERROR', e.message, '\n', e.stack?.slice(0, 300))
})
page.on('requestfailed', (r) => console.log('REQFAIL', r.url(), r.failure()?.errorText))

try {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 })
} catch (e) {
  console.log('GOTO_ERROR', e.message)
}
await page.waitForTimeout(2500)

async function visit(label) {
  try {
    await page.getByRole('button', { name: label, exact: true }).first().click({ timeout: 4000 })
    await page.waitForTimeout(700)
    const len = await page.$eval('#app', (el) => el.innerHTML.length).catch(() => 0)
    console.log(`tab ${label}: app len ${len}`)
  } catch (e) {
    console.log(`tab ${label}: CLICK FAIL ${e.message.slice(0, 80)}`)
  }
}

console.log('initial app len:', await page.$eval('#app', (el) => el.innerHTML.length).catch(() => 0))
await visit('Program')
await visit('Progress')
await visit('⚙')
await visit('Today')

console.log(errors === 0 ? 'NO RUNTIME ERRORS ✓' : `${errors} RUNTIME ERRORS ✗`)
await browser.close()
process.exit(errors ? 1 : 0)
