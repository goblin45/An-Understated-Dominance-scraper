const puppeteer = require("puppeteer")
const fs = require('fs/promises')

const scrape = async() => {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.setViewport({width: 1080, height: 1024})

    let episode = 1
    while (episode < 10) {

        await page.goto(`https://allnoveljr.com/an-understated-dominance-by-marina-chapter-${episode}/`)

        const episodeData = await page.$eval('div.epcontent.entry-content', ele => ele.innerHTML)

        let filteredText = ''
        let acceptChar = true
        let scriptActive = false
        for (i = 0; i < episodeData.length; i++) {
            // handle angular bracket, scripts and non-breaking space
            if (episodeData[i] === '<') {
                acceptChar = false
                if (episodeData.substring(i + 1, i + 7) === "script") {
                    scriptActive = true
                } else if (episodeData.substring(i + 1, i + 8) === "/script") {
                    scriptActive = false
                    i += 3
                }
                continue
            } 
            if (episodeData[i] === '>') {
                acceptChar = true
                continue
            }
            if (episodeData[i] === '&') {
                if (episodeData[i + 1] === 'n' && episodeData[i + 2] === 'b' && episodeData[i + 3] === 's' && episodeData[i + 4] === 'p') {
                    i += 5
                    filteredText += ' '
                    continue
                }
            }
            if (acceptChar == true && scriptActive == false) {
                // handle a*s cases
                if (episodeData[i] === '*' && filteredText[filteredText.length - 1] === 'a') {
                    filteredText += 's'
                } else {
                    filteredText += episodeData[i]
                }
            }
        }
    
        console.log(filteredText)
    
        await fs.appendFile('Story.txt', filteredText, 'utf-8', function(error){
            console.log('Error occurred while writing the file.')
        })

        episode++
    }

    await browser.close()
}

scrape()