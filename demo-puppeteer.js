'use strict'

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const BROWSER_OPTIONS = {
  headless: !process.argv.includes('--no-headless'),
  dumpio: process.argv.includes('--dumpio'),
  args: [
    '--disable-gpu',
    '--no-sandbox'
  ]
}
const VIEWPORT = {
  width: 1366,
  height: 768
}
const REQUEST_INTERCEPTED = true
const DATA_DIR  = path.join(__dirname, './data')
const PAGE_URL  = 'https://login.bizmanager.yahoo.co.jp/login?action=destroy&url=https://business.yahoo.co.jp/'
const PAGE_USER = 'goslet3417poet'
const PAGE_PWD  = 'kasemituyo4!'

let browser = undefined
const requestInterceptors = []
const responseHandlers = []

const logError = err => console.error(`--> Log error: ${err}`)

puppeteer.launch(BROWSER_OPTIONS).then(async browserInstance => {
  browser = browserInstance

  const page = await browser.newPage()
  await page.setViewport(VIEWPORT)
  await page.setRequestInterceptionEnabled(REQUEST_INTERCEPTED)

  // Setup main request interceptor
  page.on('request', req => {
    let reqContinue = true
    for (const interceptor of requestInterceptors) {
      // Abort the request if any handler returns false (boolean)
      if (interceptor(req) === false) {
        reqContinue = false
      }
    }
    reqContinue ? req.continue() : req.abort()
  })

  // Setup main response handler
  page.on('response', resp => {
    responseHandlers.forEach(handler => handler(resp))
  })

  try {
    await page.goto(PAGE_URL)
    console.log('-> Entered the page')

    // Click to change language to English
    await page.click('#langexc > ul > li:nth-child(2) > a')
    await page.waitForNavigation()
    console.log('-> Clicked "English" button');

    // Login
    await page.focus('input#user_name')
    await page.type(PAGE_USER)
    console.log('-> Entered username');
    await page.focus('input#password')
    await page.type(PAGE_PWD)
    console.log('-> Entered password');
    await page.click('form[name="login_form"] input[type="submit"]')
    await page.waitForNavigation()
    console.log('-> Logged in')

    await page.click('#usesrv dl:nth-of-type(2) dd.cen a')
    await page.waitForNavigation({
      timeout: 120000 // 2 minutes
    })
    console.log('-> Navigated to page 2')

    await page.click('#side-menu li:nth-of-type(4) a')
    await page.waitForNavigation()
    console.log('-> Navigated to page 3');

    await page.click('a.btn.btn-success')
    await page.waitForNavigation()
    console.log('-> Navigated to page 4')

    await page.waitForFunction('document.querySelector("#cover > #lock") == null')
    console.log('-> Page cover has gone')
    await page.evaluate(() => {
      $('input[name="free_ds_name"]').val('Mai Anh Nam was there')
      $('select[name="frame_size_1"]').val(3)
      $('#1').mouseover() // Trigger the form to show the _adframe_m_id inputs
      $('input[name="_adframe_m_id"]:visible').last().click()
      $('input[name="ad_position"]').last().click()
      $('input[name="expect_pv"]').val(10000)

      submit_form.submit()
    })
    console.log('-> Data entered & submitted')

    await page.screenshot({
      path: 'screenshot.png',
      fullPage: true
    })
    console.log('-> Screenshot took & saved')

    console.log('-> Done!');

  } catch (err) {
    throw err
  }
}).catch(err => {
  logError(err)
}).then(async () => {
  await browser.close()
  process.exit()
})
