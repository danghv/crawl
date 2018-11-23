import puppeteer from 'puppeteer'

async function takeShot(page, shotName) {
	await page.screenshot({ path: `images/${shotName}.png`})
}

async function takePDF(page, pdfName, pdfFormat) {
	await page.pdf({path: `pdf/${pdfName}`, format: `${pdfFormat}`})
}

async function getDimensions(page) {
	return await page.evaluate(() => {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
			deviceScaleFactor: window.devicePixelRatio
		}
	})
}

async function loginFacebook(username: string, password: string) {
	return new Promise(async (resolve, reject) => {
		try{
			const browser = await puppeteer.launch({headless: false, args: ['--disable-notifications']})
			const page = await browser.newPage()
			await page.goto('https://dantri.com.vn', {waitUntil: 'networkidle0'})
			// await page.waitForSelector('#email')
			//find the id of login button
			const inputTags = await page.evaluate(() => {
				let results = []
				let items = document.getElementsByTagName('div')
				// items.forEach(item => {
				// 	results.push({
				// 		value: item
				// 	})
				// })
				for (let i = 0; i < items.length; i ++){
					results.push({
						value: items[i]
					})
				}
				return results
			})
			// await page.type('#email', username)
			// await page.type('#pass', password)
			// await page.click('#u_0_2')
			// await page.waitForNavigation()
			// await takeShot(page, 'facebook')
			await browser.close()
			return resolve(inputTags)
		} catch (e) {
			console.log('login error: ', e)
			reject(e)
		}
	})
}