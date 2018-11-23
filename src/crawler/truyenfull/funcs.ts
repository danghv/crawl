import puppeteer from 'puppeteer'
import _ from 'lodash'
import { CrawlStorySchema, StorySchema } from '../../data/models/story'
import { CategoryStorySchema } from '../../data/models/categoryStory'

interface CrawlStoryTypes {
	thumbnail: string
	linkToCrawl: string
	name: string
	label: string
	author: string
	chapters: string
}

async function getStoryContent(record: any) {
	const totalChapters = parseInt(record.chapters.replace('Chương', '').trim())
	const browser = await puppeteer.launch({headless: false})
	const page = await browser.newPage()
	await page.goto(record.linkToCrawl)
	await page.waitFor(5000)
	const storySelector = '#truyen > div.col-xs-12.col-sm-12.col-md-9.col-truyen-main > div.col-xs-12.col-info-desc > div.col-xs-12.col-sm-4.col-md-4.info-holder'
	const detailStory = await page.$$eval(storySelector, storyDetail => {
		return storyDetail.map(content => {
			const info = content.childNodes[1]
			const category = info.childNodes[1].textContent.replace('Thể loại:', '').split(',').map(item => item.trim())
			const status = info.childNodes[info.childNodes.length - 1].textContent.replace('Trạng thái:', '').trim()
			return {category, status}
		})
	})
	// console.log('....', detailStory[0])
	const story = new StorySchema({
		thumbnail: record.thumbnail,
		linkToCrawl: record.linkToCrawl,
		name: record.name.trim(),
		label: record.label,
		author: record.author.trim(),
		chapters: parseInt(record.chapters.replace('Chương', '').trim()),
		category: _.union(record.category, detailStory[0].category),
		status: detailStory[0].status
	})
	StorySchema.find({name: record.name.trim(), author: record.author.trim()}, (err, docs) => {
		if (err) {
			console.log('err...', err)
		}
		if (docs.length === 0) {
			story.save().then(result => console.log('save to db...'))
		}
	})

	await browser.close()
	for (let i = 0; i < totalChapters; i ++) {
		const browser = await puppeteer.launch({headless: false})
		const page = await browser.newPage()
		await page.goto(`${record.linkToCrawl}chuong-${i + 1}`)
		await page.waitFor(5000)
		const contentSelector = '#wrap > div.container.chapter > div > div > div.chapter-c'
		const content = await page.$$eval(contentSelector, divContent => {
			return divContent.map(div => {
				let temp = []
				div.childNodes.forEach(item => {
					if(item.nodeName === '#text' || item.nodeName === 'BR')	{
						temp.push(item)
					}
				})
				const contentDiv = temp.map(it => {
					if(it.nodeName === '#text') {
						return it.data
					}
					else{
						return '<' + it.localName + '>'
					}
				})
					.join(' ')

				return contentDiv
			})
		})
		// console.log('content...', content)
		StorySchema.find({name: record.name.trim(), author: record.author.trim()}, (err, docs: any) => {
			if (err) {
				console.log('err...', err)
			}
			if (docs.length > 0) {
				StorySchema.findById(docs[0].id, (err, doc: any) => {
					if (err) {
						console.log('error found...', err)
					}

					if (doc.content.length === 0){
						doc.content = [{chapter: 1, text: content}]
						// doc.content = newContent
						doc.save().then(r => console.log('updated story...'))
					} else {
						const newContent = doc.content.map(chap => chap.chapter).includes(i + 1)
							?   doc.content
							: [...doc.content, {chapter: i + 1, text: content}]
						doc.content = newContent
						doc.save().then(r => console.log('updated story...'))
					}
				})
			}
		})
		await browser.close()
	}
	console.log('done!')
}

async function getStoryContentWithExitedRecord(record: any) {
	const totalChapters = record.chapters
	for (let i = 0; i < totalChapters; i ++) {
		const browser = await puppeteer.launch({headless: true})
		const page = await browser.newPage()
		await page.goto(`${record.linkToCrawl}chuong-${i + 1}`, { timeout: 600000})
		await page.waitFor(5000)
		const contentSelector = '#wrap > div.container.chapter > div > div > div.chapter-c'
		const content = await page.$$eval(contentSelector, divContent => {
			return divContent.map(div => {
				let temp = []
				div.childNodes.forEach(item => {
					if(item.nodeName === '#text' || item.nodeName === 'BR')	{
						temp.push(item)
					}
				})
				const contentDiv = temp.map(it => {
					if(it.nodeName === '#text') {
						return it.data
					}
					else{
						return '<' + it.localName + '>'
					}
				})
					.join(' ')

				return contentDiv
			})
		})
		// console.log('content...', content)
		StorySchema.findById(record.id, (err, doc: any) => {
			if (err) {
				console.log('error found...', err)
			}
			if (doc.content.length === 0){
				doc.content = [{chapter: 1, text: content}]
				doc.save().then(r => console.log('updated story...'))
			} else {
				const newContent = doc.content.map(chap => chap.chapter).includes(i + 1)
					?   doc.content
					: [...doc.content, {chapter: i + 1, text: content}]
				doc.content = newContent
				doc.save().then(r => console.log('updated story...'))
			}
		})
		await browser.close()
	}
	console.log('done exited func!')
}

async function getCrawlStorySchema() {
	const fetchCategories: any = await CategoryStorySchema.find({})
	//done: Xuyen khong, Dam My, Co Dai, truyen ngon tin,
	const filterArray = ['Ngôn Tình', 'Xuyên Không', 'Đam Mỹ', 'Cổ Đại', 'truyện ngôn tình', 'Truyện Teen', 'Đô Thị', 'Dị Năng',
		'Võng Du', 'Quân Sự', 'Ngược', 'Gia Đấu', 'Sủng', 'Nữ Phụ', 'Linh Dị', 'Khác', 'Sắc', 'Tiên Hiệp', 'Quan Trường', 'Khoa Huyễn',
		'Kiếm Hiệp', 'Dị Giới', 'Huyền Huyễn', 'Trinh Thám', 'Việt Nam', 'Hài Hước']
	const categories = fetchCategories.filter(cat => !filterArray.includes(cat.text))
	console.log(categories)
	for (let i = 0; i < categories.length; i++) {
		for (let j = 0; j <= categories[i].pages; j++) {
			const browser = await puppeteer.launch({headless: true})
			const page = await browser.newPage()
			await page.goto(`${categories[i].url}trang-${j}`)
			await page.waitFor(5000)
			const rowsSelector = '#list-page > div.col-xs-12.col-sm-12.col-md-9.col-truyen-main > div.list.list-truyen.col-xs-12 > div.row'
			await page.$$eval('*', (items) => {
				window.scrollBy(0, window.innerHeight)
				return
			})
			await page.waitFor(5000)
			await page.$$eval('*', (items) => {
				window.scrollBy(0, window.innerHeight)
				return
			})
			await page.waitFor(5000)
			await page.$$eval('*', (items) => {
				window.scrollBy(0, window.innerHeight)
				return
			})
			await page.waitFor(5000)
			await page.$$eval('*', (items) => {
				window.scrollBy(0, window.innerHeight)
				return
			})
			await page.waitFor(5000)

			const listRows = await page.$$eval(rowsSelector, rows => {
				return rows.map(row => {
					const thumbnail = row.childNodes[0].childNodes[0].childNodes[0].src
					const story = row.childNodes[1].childNodes[0].childNodes[2].childNodes[0]
					const titles = []
					let author = ''
					const chapters = row.childNodes[2].childNodes[0].childNodes[0].textContent
					row.childNodes[1].childNodes[0].childNodes.forEach(node => {
						if(node.classList && node.classList.value.includes('label-title')){
							titles.push(node.classList.value)
						}
						if (node.classList && node.classList.value.includes('author')){
							author = node.textContent
						}
					})
					return {
						thumbnail,
						linkToCrawl: story.href,
						name: story.textContent,
						label: titles.toString(),
						author,
						chapters
					}
				})
			})
			// console.log(listRows)
			listRows.map((crawlStory: CrawlStoryTypes) => {
				const category = categories[i].text
				const story = new CrawlStorySchema({
					thumbnail: crawlStory.thumbnail,
					linkToCrawl: crawlStory.linkToCrawl,
					name: crawlStory.name,
					label: crawlStory.label,
					author: crawlStory.author,
					chapters: crawlStory.chapters,
					category: [category]
				})
				// console.log(story)
				CrawlStorySchema.find({name: crawlStory.name, author: crawlStory.author}, (err, stories) => {
					if (err) {
						console.log('error found:...', err)
					} else {
						if (stories.length > 0) {
							CrawlStorySchema.findById(stories[0].id, (err, doc: any) => {
								if (err) {console.log(err)}
								// const newCategory = doc.category.includes(categories[i].text) ? doc.category : [...doc.category].push(categories[i].text)
								// console.log('new category: ', newCategory)
								doc.chapters = crawlStory.chapters
								doc.category = [category]
								doc.save().then(resul => console.log('updated document...', resul))
							})
						} else {
							story.save().then(result => console.log('saved to db...', result))
						}
					}
				})
			})
			await browser.close()
		}
	}
}

function crawlStories(webName) {
	return new Promise(async (resolve, reject) => {
		try {
			const browser = await puppeteer.launch({headless: true})
			const page = await browser.newPage()
			await page.goto(webName)
			await page.waitFor(5000)
			const allElements = await page.evaluate((selector) => {
				let results = []
				document.querySelectorAll(selector).forEach(item => {
					if (item.getAttribute('href') && item.getAttribute('href') !== 'javascript:void(0)' && item.localName === 'a') {
						results.push({
							url: item.getAttribute('href'),
							text: item.innerText
						})
					}
				})
				return results
			}, '*')
			await browser.close()
			return resolve(allElements)
		}
		catch (e) {
			return reject(e)
		}
	})
}

const getCategories = async (webName: string) => {
	const results = await crawlStories(webName)
		.then((links: any) => {
			// console.log(links, links.length)
			const categories = links.filter(link => {
				return link.url.includes(`${webName}the-loai/`)
			})
			return categories
		})
		.catch(e => console.log('error...', e))
	return results
}

async function saveCategoryToDB() {
	await getCategories('https://truyenfull.vn/')
		.then(results => {
			const categories = results.reduce((accumulator, currentValue) => {
				if (!(accumulator.filter(item => item.url === currentValue.url).length > 0)) {
					accumulator.push(currentValue)
				}
				return accumulator
			}, [])
			// console.log(categories, categories.length)
			return categories
		})
		.then(res => {
			return res.map(item => {
				const category = new CategoryStorySchema({
					url: item.url,
					text: item.text
				})
				CategoryStorySchema.find({url: item.url}, (err, docs) => {
					console.log('document...', docs)
					if (docs.length === 0) {
						return category.save()
					}
					return
				})
			})
		})
		.catch(e => console.log('error..........', e))
}

async function getMaxPageOfCategory() {
	const categoryLinks: any = await CategoryStorySchema.find({})
	for (let i = 0; i < categoryLinks.length; i ++) {
		// console.log(categoryLinks[i], categoryLinks[i].url)
		const browser = await puppeteer.launch({headless: true})
		const page = await browser.newPage()
		await page.goto(categoryLinks[i].url)
		await page.waitFor(3000)
		const maxPage = await page.evaluate((selector) => {
			let results = []
			document.querySelectorAll('a').forEach(item => {
				if (item.getAttribute('href') && item.getAttribute('href').includes(`${selector}trang-`)) {
					results.push({url: item.getAttribute('href')})
				}
			})
			return results
		}, categoryLinks[i].url)
		const numberArray = maxPage.map(xxx => {
			return parseInt(xxx.url.replace(`${categoryLinks[i].url}trang-`, '').slice(0, -1))
		})
		const maximum = Math.max(...numberArray)
		// console.log('max page...', maximum)
		CategoryStorySchema.findById(categoryLinks[i].id, (err, doc: any) => {
			if (err) {console.log(err)}
			doc.pages = maximum !== -Infinity ? maximum : 1
			doc.save().then(resul => console.log(resul))
		})
		await browser.close()
		// return maxPage
	}
}