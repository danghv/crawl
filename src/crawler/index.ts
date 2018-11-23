import puppeteer from 'puppeteer'
import { login } from './ymeetme'
import { PersonSchema } from '../data/models/person'
import mongoose from 'mongoose'
import { testFunc } from './examples'

async function initBrower(pupp, status = false) {
	return await pupp.launch({headless: status})
}

async function initPage(browser, link) {
	const page = await browser.newPage()
	await page.goto(link)
	return page
}

async function takeShot(page, shotName) {
	await page.screenshot({ path: `images/${shotName}.png`})
}

async function closeBrowser(browser) {
	await browser.close()
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
			const browser = await puppeteer.launch({headless: true, args: ['--disable-notifications']})
			const page = await browser.newPage()
			await page.goto('https://www.facebook.com', {waitUntil: 'networkidle0'})
			await page.waitForSelector('#email')
			await page.type('#email', username)
			await page.type('#pass', password)
			const submitButton = await page.$('#login_form > table > tbody > tr:nth-child(2) > td:nth-child(3) > label#loginbutton > input')
			await submitButton.click()
			await page.waitForNavigation()
			return resolve(page)
		} catch (e) {
			console.log('login error: ', e)
			reject(e)
		}
	})
}

async function getListFriends(username: string, password: string) {
	const page:any = await loginFacebook(username, password)
	// await page.click('#u_0_d > div:nth-child(1) > div:nth-child(1) > div > a')
	await page.click('#u_0_a > div:nth-child(1) > div:nth-child(1) > div > a')
	await page.waitForSelector('#u_fetchstream_2_8 > li:nth-child(3) > a')
	await page.click('#u_fetchstream_2_8 > li:nth-child(3) > a')
	// await page.click('#u_0_17 > li:nth-child(3) > a')
	await page.waitForNavigation()

	// const friendList = page.evaluate(friendListSelectors => {
	// 	// const friends = Array.from(document.querySelectorAll('#pagelet_timeline_app_collection_100001533999634\\3a 2356318349\\3a 2 > ul > li:nth-child(1) > div > a'))
	// 	const friends = Array.from(document.querySelectorAll(friendListSelectors))
	// 	return friends.map((friend: any) => {
	// 		const title = friend.childNodes[0].attributes['aria-label']
	// 		return { title, href: `${friend.href}` }
	// 	})
	// }, '#pagelet_timeline_app_collection_100001533999634\\3a 2356318349\\3a 2 > ul > li:nth-child(2) > div > a')
	// console.log(friendList)
	// return friendList
}

async function testTrace() {
	const browser = await puppeteer.launch({headless: false})
	const page = await browser.newPage()
	await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
	await page.goto('https://news.ycombinator.com/news')

	// execute standard javascript in the context of the page.
	const stories = await page.$$eval('a.storylink', anchors => { return anchors.map(anchor => anchor.textContent).slice(0, 10) })
	console.log(stories)
	await page.tracing.stop()

}

// testTrace()

// getListFriends('hadangktmt', 'Dang0224')
login('hadangktmt', 'Dang0224')
	.then((results: any) => {
		console.log('result...', results)
		mongoose.connect(`mongodb://danghv:Dang2402@ds117719.mlab.com:17719/whoamid-project`)
		mongoose.connection.once('open', () => {
			console.log('connected to database')
		})
		results.forEach(result => {
			let person = new PersonSchema({
				name: result.name,
				email: '',
				phoneNumber: '',
				socialMedia: [
					{
						ymeetme: {
							profile: result.profile
						}
					}
				]
			})
			PersonSchema.find({name: result.name}, (err, docs) => {
				console.log('document...', docs)
				if (docs.length === 0) {
					person.save()
				}
			})
		})
		console.log('done!!!')
		return null
	})
	.catch(e => console.log('error from save data...', e))

// testFunc()