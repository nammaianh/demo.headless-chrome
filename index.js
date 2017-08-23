'use strict'

const chromeLauncher = require('chrome-launcher')
const CDP = require('chrome-remote-interface')
const fs = require('fs')

const chromeOptions = require('./chromeOptions')
const cdpOptions = require('./cdpOptions')

chromeLauncher
  .launch(chromeOptions)
  .then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`)

    CDP(cdpOptions, client => {
      const { Network, Page } = client

      Network.requestWillBeSent(params => {
        console.log(params.request.url)
      })

      Page.loadEventFired(() => {
        client.close()
      })

      Promise.all([
        Network.enable(),
        Page.enable()
      ]).then(() => {
        return Page.navigate({
          url: 'http://myina.vn',
        })
      }).then(() => {
        return Page.captureScreenshot({
          format: 'png'
        })
      }).then(screenshot => {
        const buffer = new Buffer(screenshot.data, 'base64')
        fs.writeFile('screenshot.png', buffer, 'base64', err => {
          if (err) {
            console.error(err)
          } else {
            console.log('Screenshot saved')
          }

          client.close()
          chrome.kill()
        })
      }).catch(err => {
        console.error(err)
        client.close()
      })
    }).on('error', err => {
      console.error(err)
    })
  })
