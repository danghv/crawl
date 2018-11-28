import mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const ContentSchema = mongoose.model('ContentStory', new Schema({
	content: [{chapter: Number, title: String, text: String}]
}))

export const StorySchemaFull = mongoose.model('StoryFull', new Schema({
	thumbnail: [{ type: String, default: ''}],
	linkToCrawl: [{ type: String, default: ''}],
	name: { type: String, default: ''},
	label: { type: String, default: ''},
	author: { type: String, default: ''},
	chapters: { type: Number, default: 0},
	category: [{ type: String, default: ''}],
	status: { type: String, default: ''},
	contentId: { type: Schema.Types.ObjectId, ref: 'ContentStory' }
}))