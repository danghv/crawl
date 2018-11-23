import mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const CategoryStorySchema = mongoose.model('CategoryStory', new Schema({
	url: String,
	text: String,
	pages: Number
}))