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

let browser = undefined

puppeteer.launch(BROWSER_OPTIONS).then(async browserInstance => {
  browser = browserInstance
  console.log('-> Connected')

  const page = await browser.newPage()
  await page.setViewport(VIEWPORT)

  try {
    await page.goto('http://www.aconvert.com/image/', {
      timeout: 120000 // 2 minutes
    })
    console.log('-> Entered the page')

    const formatSelector = await page.$('#targetformat')
    await formatSelector.evaluate(formatSelector => formatSelector.value = 'png')
    console.log('-> Selected PNG format')

    await page.uploadFile('#file', `${__dirname}/avatar-source.jpg`)
    console.log('-> Selected source image')

    await page.click('#submitbtn')
    console.log('-> Submitted')

    await page.waitForSelector('#tr1')
    console.log('-> Result has been shown')

    await page.screenshot({
      path: 'screenshot.png',
      fullPage: true
    })
    console.log('-> Screenshot took & saved')

    console.log('-> Done')

  } catch (err) {
    throw err
  }
}).catch(err => {
  console.error(err)
}).then(async () => {
  await browser.close()
  process.exit()
})
