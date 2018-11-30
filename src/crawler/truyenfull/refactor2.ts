import puppeteer from 'puppeteer'
import { StorySchemaFull, ContentSchema} from '../../data/models/story-full'
import _ from 'lodash'
import { readData } from './crawlFromJsonFiles'
import { categories } from './files'
import { fetchContentStory } from './testStoryContent'

export function fetchStory(name, author){
	return new Promise((resolve, reject) => {
		try {
			const story = StorySchemaFull.find({name, author})
			resolve(story)
		}
		catch (e) {
			reject(e)
		}
	})
}

function handleFirstimeCrawl(record: any) {
	return new Promise(async (resolve, reject) => {
		try {
			const totalChapters = parseInt(record.chapters.replace('Chương', '').trim()) || 0
			const browser = await puppeteer.launch({headless: true})
			const page = await browser.newPage()
			await page.goto(record.linkToCrawl, {timeout: 600000})
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
			console.log('....', detailStory[0])
			const contentStory = new ContentSchema({
				content: []
			})
			const contentStorySaved = await contentStory.save()
			const story = new StorySchemaFull({
				thumbnail: record.thumbnail,
				linkToCrawl: record.linkToCrawl,
				name: record.name.trim(),
				label: record.label,
				author: record.author.trim(),
				chapters: totalChapters,
				category: _.union(record.category, detailStory[0].category),
				status: detailStory[0].status,
				contentId: contentStorySaved._id
			})
			const isStoryStored: any = await fetchStory(record.name.trim(), record.author.trim())
			// console.log('is story stored...', isStoryStored)
			if (isStoryStored.length === 0){
				resolve(story.save().then(res => res))
			} else {
				resolve(isStoryStored)
			}
			await browser.close()
		}
		catch (e) {
			console.log('error at handleFirstimeCrawl func', e)
			reject(e)
		}
	})
}

function crawlStory(storyRecord: any) {
	return new Promise(async (resolve, reject) => {
		try {
			const contentStory: any = await StorySchemaFull.findOne(storyRecord).populate('contentId')
			const contentStoryId = contentStory.contentId._id
			const contentOfStory: any = await ContentSchema.findById(contentStoryId)
			const lastChapter = contentOfStory.content.length > 0 ? contentOfStory.content[contentOfStory.content.length - 1].chapter : 0
			console.log('last chapter...', lastChapter)
			for (let i = lastChapter; i < storyRecord.chapters; i ++) {
				const browser = await puppeteer.launch({headless: true})
				const page = await browser.newPage()
				await page.goto(`${storyRecord.linkToCrawl}chuong-${i + 1}`, { timeout: 600000})
				await page.waitFor(3000)
				const contentSelector = '#wrap > div.container.chapter > div > div > div.chapter-c'
				const content = await page.$$eval(contentSelector, divContent => {
					return divContent.map(div => {
						let temp = []
						let temp2 = []
						div.childNodes.forEach(item => {
							if(item.nodeName === '#text' || item.nodeName === 'BR')	{
								temp.push(item)
							}
							if (item.nodeName === 'P') {
								temp2.push(item)
							}
						})
						const contentDiv = temp.length > 10
							?
							temp.map(it => {
								if(it.nodeName === '#text') {
									return it.data
								}
								else{
									return '<' + it.localName + '>'
								}
							})
								.join(' ')
							:
							temp2.length > 10 ?
								temp2.map(ite => {
									// return it2.data
									return '<' + ite.localName + '>' + ite.textContent + '<' + ite.localName + '/>'
								})
								:
								''
						return contentDiv
					})
				})
				const chapterTitle = '#wrap > div.container.chapter > div > div > h2 > a'
				const title = await page.$$eval(chapterTitle, aTitle => {
					return aTitle.map(a => {
						return a.textContent
					})
				})
				console.log('title chapter...', title)
				if (contentOfStory.content.length === 0){
					contentOfStory.content = [{chapter: 1, title: title[0], text: content[0]}]
					contentOfStory.save().then(r => console.log('updated story...'))
				} else {
					const newContent = contentOfStory.content.map(chap => chap.chapter).includes(i + 1)
						?   contentOfStory.content
						: [...contentOfStory.content, { chapter: i + 1, title: title[0], text: content[0] }]
					contentOfStory.content = newContent
					contentOfStory.save().then(r => console.log('updated story...'))
				}

				await browser.close()
			}
			const crawledStory: any = await StorySchemaFull.find({name: storyRecord.name, author: storyRecord.author})
			resolve(crawledStory)
		}
		catch (e) {
			console.log('error in crawlStory function', e)
			reject(e)
		}
	})
}

function crawlStoryWithRawData(rawStory: any) {
	return new Promise(async (resolve, reject) => {
		try {
			const storyStatus: any = await fetchStory(rawStory.name.trim(), rawStory.author.trim())
			if (storyStatus.length === 0) {
				const storySaved: any = await handleFirstimeCrawl(rawStory)
				console.log('saved...', storySaved.name)
				const isDone = await crawlStory(storySaved)
				resolve(isDone)
			} else {
				console.log('story is saved before...')
				console.log('story name', storyStatus[0].name)
				const isDone = crawlStory(storyStatus[0])
				resolve(isDone)
			}

		}
		catch (e) {
			console.log('error at crawlStoryWithRawData function...', e)
			reject(e)
		}
	})
}

// export async function crawl() {
// 	const input: any = await readData(categories[2])
// 	const test: any = input
// 	for (let i = 0; i < test.length; i ++ ){
// 		await crawlStoryWithRawData(test[i])
// 	}
// }

export async function crawl() {
	const input: any = await StorySchemaFull.find({category: categories[1].category, status: "Đang ra"})
	console.log('input...', input.length)
	// const test: any = input
	// const test = input.map(inp => {return inp.contentId.content})
	// console.log(test)
	for (let i = 0; i < input.length; i ++ ){
		await fetchContentStory(input[i])
	}
	console.log('done all...!')
}