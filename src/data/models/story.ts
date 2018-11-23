import mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const CrawlStorySchema = mongoose.model('CrawlStory', new Schema({
	thumbnail: String,
	linkToCrawl: String,
	name: String,
	label: String,
	author: String,
	chapters: String,
	category: [String]
}))

export const StorySchema = mongoose.model('Story', new Schema({
	thumbnail: [String],
	linkToCrawl: [String],
	name: String,
	label: String,
	author: String,
	chapters: Number,
	category: [String],
	status: String,
	content: [{chapter: Number, text: String}]
}))