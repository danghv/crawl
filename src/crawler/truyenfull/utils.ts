import puppeteer from 'puppeteer'
import { CrawlStorySchema, StorySchema } from '../../data/models/story'
import _ from 'lodash'

const categories = [
	'Tiên Hiệp', 'Kiếm Hiệp', 'Ngôn Tình', 'Đô Thị', 'Quan Trường', 'Võng Du', 'Khoa Huyễn', 'Huyền Huyễn', 'Dị Giới', 'Dị Năng',
	'Quân Sự', 'Lịch Sử', 'Xuyên Không', 'Trọng Sinh', 'Trinh Thám', 'Thám Hiểm', 'Linh Dị', 'Sắc', 'Ngược', 'Sủng',
	'Cung Đấu', 'Nữ Cường', 'Gia Đấu', 'Đông Phương', 'Đam Mỹ', 'Bách Hợp', 'Hài Hước', 'Điền Văn', 'Cổ Đại', 'Mạt Thế',
	'Truyện Teen', 'Phương Tây', 'Nữ Phụ', 'Light Novel', 'Việt Nam', 'Đoản Văn', 'Khác'
]

export function fetchStoriesWithCat(category, limit) {
	return new Promise((resolve, reject) => {
		try {
			const crawlStories = limit !== 0 ? CrawlStorySchema.find({category}).limit(limit) : CrawlStorySchema.find({category})
			resolve(crawlStories)
		}
		catch (e) {
			reject(e)
		}
	})
}

export function fetchStory(name, author){
	return new Promise((resolve, reject) => {
		try {
			const story = StorySchema.find({name, author})
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
				chapters: totalChapters,
				category: _.union(record.category, detailStory[0].category),
				status: detailStory[0].status
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
			const totalChapters = storyRecord.chapters
			for (let i = 0; i < totalChapters; i ++) {
				const browser = await puppeteer.launch({headless: true})
				const page = await browser.newPage()
				await page.goto(`${storyRecord.linkToCrawl}chuong-${i + 1}`, { timeout: 600000})
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
				const doc: any = await StorySchema.findById(storyRecord.id)
				// console.log('doc...............', doc)
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
				await browser.close()
			}
			const crawledStory: any = await StorySchema.find({name: storyRecord.name, author: storyRecord.author})
			// console.log('crawled story...', crawledStory)
			resolve(crawledStory)
		}
		catch (e) {
			console.log('error in crawlStory function', e)
			reject(e)
		}
	})
}

// function crawlStories(stories) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			stories.map(story => {
// 				return new Promise(async (resolve, reject) => {
// 					try {
// 						const storyStatus: any = await fetchStory(story.name.trim(), story.author.trim())
// 						console.log('story status')
// 						if (storyStatus.length === 0) {
// 							const storySaved = await handleFirstimeCrawl(story)
// 							console.log('saved...')
// 							const isDone = await crawlStory(storySaved)
// 							resolve(isDone)
// 						}
// 						else {
// 							console.log('story is saved before...')
// 							const isDone = crawlStory(storyStatus[0])
// 							resolve(isDone)
// 						}
// 					}
// 					catch (e) {
// 						reject(e)
// 					}
// 				})
// 			})
// 		}
// 		catch (e) {
// 			reject(e)
// 		}
// 	})
// }

function crawlStories(stories) {
	return new Promise((resolve, reject) => {
		try {
			const x = stories.map(story => {
				return new Promise(async (resolve, reject) => {
					try {
						const storyStatus: any = await fetchStory(story.name.trim(), story.author.trim())
						console.log('story status')
						if (storyStatus.length === 0) {
							const storySaved = await handleFirstimeCrawl(story)
							console.log('saved...')
							const isDone = await crawlStory(storySaved)
							resolve(isDone)
						}
						else {
							console.log('story is saved before...')
							const isDone = crawlStory(storyStatus[0])
							resolve(isDone)
						}
					}
					catch (e) {
						reject(e)
					}
				})
			})
			Promise.all(x).then(res => resolve(res))
		}
		catch (e) {
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

export async function crawl() {
	const crawledStories = []
	const input: any = await fetchStoriesWithCat(categories[1], 0)
	console.log('total story...', input.length)
	// const input = await fetchStory('Sợi Khói Mỏng Lạc Giữa Trần Ai', 'Diệp Lạc Vô Tâm')
	// const input2: any = await fetchStory('Có Hai Con Mèo Ngồi Bên Cửa Sổ', 'Nguyễn Nhật Ánh')
	// console.log(input[0])
	// const test = input2.concat(input)
	const test: any = input
	// console.log('test array...', test)
	for (let i = 4; i < test.length; i ++ ){
		await crawlStoryWithRawData(test[i])
	}


	// const res1 = await crawlStory(input[0])
	// console.log('res1', res1)
	//
	// const res2 = await crawlStory(input2[0])
	// console.log('res2', res2)
	// const dones = await crawlStories(input)
	// console.log('done....', dones)
	// const storyStatus: any = await fetchStory(input[1].name.trim(), input[1].author.trim())
	// if (storyStatus.length === 0) {
	// 	const storySaved = await handleFirstimeCrawl(input[1])
	// 	console.log('saved...', storySaved)
	// 	crawlStory(storySaved)
	// }
	// else {
	// 	console.log('story is saved before...')
	// 	crawlStory(storyStatus[0])
	// }
}