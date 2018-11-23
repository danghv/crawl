import mongoose from 'mongoose'
import { PersonSchema } from '../data/models/person'

mongoose.connect(`mongodb://danghv:Dang2402@ds117719.mlab.com:17719/whoamid-project`)
mongoose.connection.once('open', () => {
	console.log('connected to database')
})


