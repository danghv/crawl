import puppeteer from 'puppeteer'

export function login(username, password) {
	return new Promise(async (resolve, reject) => {
		try {
			const browser = await puppeteer.launch({headless: true})
			const page = await browser.newPage()
			await page.goto('https://m.ymeet.me')
			const facebookButtonSelector = '#root > div > div.sticky-footer > div > div > div > section.lp-hero.lp-hero--1.l2 > div > button.lp-btn.lp-btn--primary.mbmd.lp-btn--body'
			await page.waitForSelector(facebookButtonSelector)

			//handle popup
			const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())))
			await page.click(facebookButtonSelector)
			const popup: any = await newPagePromise
			await popup.waitForSelector('#email')
			await popup.type('#email', username, {delay: 100})
			await popup.type('#pass', password)
			await popup.click('#u_0_0')
			//end handle popup

			await page.waitFor(6000)
			let girls = []
			const aTagSelector = '#detail-view-NaN > div > article.card.mbm.element_height.no-hover.z-index-1.front > div.card__upper > a'
			const nameTag = '.txt-bold.txt-lg'
			const skipButtonId = '#SkipGuaranteePolicy5'
			const skipButtonId2 = 'SkipReferralProgram'
			const backToWorkflow = '#root > div > div:nth-child(1) > div > div:nth-child(1) > div.site-header.mbm > nav > div > a.nav__link.nav__link--2.false'
			for (let i = 0; i < 50; i ++) {
				const skipButton = await page.$(skipButtonId)
				const skipButton2 = await page.$(skipButtonId2)
				const link = await page.$(aTagSelector)
				if (skipButton) {
					skipButton.click()
					await page.waitFor(1000)
				} else if (skipButton2) {
					skipButton2.click()
					await page.waitFor(1000)
				} else if (link) {
					const href = await page.$eval(aTagSelector, el => el.href)
					const name = await page.$eval(nameTag, el => el.innerText)
					girls.push({
						name,
						profile: href
					})
					await page.click('#LikeButton')
					await page.waitFor(1000)
				} else {
					await page.goto('https://m.ymeet.me/whathot')
					await page.waitFor(3000)
				}
			}
			resolve(girls)
		} catch (e) {
			// console.log('error...', e)
			reject(e)
		}
	})
}