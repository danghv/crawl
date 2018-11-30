import { filterLostNumbers } from './funcs'
import { StorySchemaFull } from '../../data/models/story-full'

export function fetchContentStory(story) {
	return new Promise(async (resolve, reject) => {
		try {
			const storyFull: any = await StorySchemaFull.findOne(story).populate('contentId')
			const contentStoryFull = storyFull.contentId.content
			const chapterArr = contentStoryFull.map(chap => chap.chapter)
			// console.log('chapter array...', chapterArr)
			const lostNumberArray = filterLostNumbers(chapterArr)
			console.log('lost number array...', lostNumberArray, story.name, story.chapters)
			resolve(lostNumberArray)
		}
		catch (e) {
			console.log('error from fethContentStory func...', e)
			reject(e)
		}
	})
}