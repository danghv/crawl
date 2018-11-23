import mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const PersonSchema = mongoose.model('Person', new Schema({
	name: String,
	email: String,
	phoneNumber: Number,
	socialMedia: Object
}))