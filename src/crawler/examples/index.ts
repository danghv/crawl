import puppeteer from 'puppeteer'

export function crawlWeb() {
	
}

export function collectAllSameOriginAnchorsDeep() {
	const allElements = []
	const findAllElements = (nodes: any) => {
		for (let i = 0; i < nodes.length; ++i) {
			allElements.push(nodes[i])
			if (nodes[i].shadowRoot) {
				findAllElements(nodes[i].shadowRoot.querySelectorAll('*'))
			}
		}
	}
	findAllElements(document.querySelectorAll('*'))
	return allElements
}

export async function testFunc() {
	const browser = await puppeteer.launch({headless: true})
	const page = await browser.newPage()
	await page.goto('https://bodhisangha.wordpress.com/')
	await page.waitFor(5000)
	await page.screenshot({path: 'example.png'})
	//get all anchors nodes
	const anchors = await page.evaluate((selector) => {
		const x = document.querySelectorAll(selector)
		let allElements = []
		const findAllElements = (nodes) => {
			for (let i = 0; i < nodes.length; ++i) {
				allElements.push(nodes[i])
				if (nodes[i].shadowRoot) {
					findAllElements(nodes[i].shadowRoot.querySelectorAll('*'))
				}
			}
		}
		findAllElements(document.querySelectorAll('*'))
		return allElements
	}, '*')
	console.log(anchors)

	await browser.close()
}

testFunc()