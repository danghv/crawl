import mongoose from "mongoose"
import { fetchStoriesWithCat } from './utils'
// import {crawl} from './utils'
import { crawl } from './refactor2'
import { saveCategoriesToFiles } from './files'
import { categories } from './files'
import { readData } from './crawlFromJsonFiles'

// mongoose.connect(`mongodb://DangHV:Dang2402@ds161856.mlab.com:61856/stories-demo`)
// mongoose.connection.once('open', () => {
// 	console.log('connected to database')
// })

// 	mongoose.connect(`mongodb://danghv:Dang2402@ds117834.mlab.com:17834/full-story`)
// 	mongoose.connection.once('open', () => {
// 	console.log('connected to database')
// })

mongoose.connect(`mongodb://danghv:Dang2402@ds063150.mlab.com:63150/story-reference-content`)
mongoose.connection.once('open', () => {
	console.log('connected to database')
})


// mongoose.connect(`mongodb://dangha:Dang2402@ds163226.mlab.com:63226/story-category`)
// mongoose.connection.once('open', () => {
// 	console.log('connected to database')
// })
mongoose.set('useFindAndModify', false)

// async function aaa() {
// 	const x = await fetchStoriesWithCat('Tiên Hiệp', 1)
// 	console.log('xxx...', x)
// }
// aaa()
crawl()
// writeToJson('Việt Nam').then(res => console.log('res....', res))
// saveCategoriesToFiles(categories)

// readData(categories[0])