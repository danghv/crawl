import { GraphQLID, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql'
import _ from 'lodash'
import { PersonTypes, StoryTypes, Content } from './types'
import { StorySchemaFull, ContentSchema } from '../models/story-full'

const RootQuery = new GraphQLObjectType({
	name: 'RootQuery',
	fields: {
		story: {
			type: StoryTypes,
			args: { name: { type: GraphQLString }, author: { type: GraphQLString }, id: { type: GraphQLID } },
			resolve(parent, args) {
				let story
				if (args.name && args.author) {
					story = StorySchemaFull.findOne({name: args.name, author: args.author}).populate('contentId')
				}
				if (args.id) {
					story = StorySchemaFull.findById(args.id).populate('contentId')
				}
				return story
			}
		},
		stories: {
			type: GraphQLList(StoryTypes),
			args: { limit: {type: GraphQLInt }, category: { type: GraphQLString }, status: { type: GraphQLString } },
			resolve(parent, args){
				let stories = StorySchemaFull.find({})
				if (args.status) {
					stories = stories.find({status: args.status})
				}
				if(args.category) {
					stories = stories.find({category: args.category})
				}
				if(args.limit) {
					stories = stories.limit(args.limit)
				}
				return stories
			}
		},
		chapter: {
			type: Content,
			args: { storyId: { type: GraphQLID }, chapter: { type: GraphQLInt }, storyName: { type: GraphQLString }, storyAuthor: { type: GraphQLString }, contentStoryId: { type: GraphQLID } },
			async resolve(parent, args) {
				let chapter
				if (args.storyId && args.chapter) {
					const story: any = await StorySchemaFull.findById(args.storyId).populate('contentId')
					// const contentStory: any = await ContentSchema.findById(story.contentId)
					chapter = story.contentId.content.filter(item => item.chapter === args.chapter)[0]
				}
				if (args.storyName && args.storyAuthor && args.chapter) {
					const story: any = await StorySchemaFull.findOne({name: args.storyName, author: args.storyAuthor}).populate('contentId')
					// const contentStory: any = await ContentSchema.findById(story.contentId)
					chapter = story.contentId.content.filter(item => item.chapter === args.chapter)[0]
				}
				if (args.contentStoryId) {
					const contentStory: any = await ContentSchema.findById(args.contentStoryId)
					chapter = contentStory.content.filter(item => item.chapter === args.chapter)[0]
				}
				return chapter
			}
		},
		chapters: {
			type: GraphQLList(Content),
			args: { storyId: { type: GraphQLID }, storyName: { type: GraphQLString }, storyAuthor: { type: GraphQLString }, id: { type: GraphQLID } },
			async resolve(parent, args) {
				let chapters
				if (args.id) {
					const contentStory: any = await ContentSchema.findById(args.id)
					chapters = contentStory.content
				}
				if (args.storyId) {
					const story: any = await StorySchemaFull.findById(args.storyId).populate('contentId')
					// const contentStory: any = await ContentSchema.findById(story.contentId)
					chapters = story.contentId.content
				}
				if (args.storyName && args.storyAuthor) {
					const story: any = await StorySchemaFull.findOne({name: args.storyName, author: args.storyAuthor}).populate('contentId')
					// const contentStory: any = await ContentSchema.findById(story.contentId)
					chapters = story.contentId.content
				}
				return chapters
			}
		},
		// content: {
		// 	type: Gra
		// }
	}
})

const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addPerson: {
			type: PersonTypes,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				email: { type: new GraphQLNonNull(GraphQLString) },
				phoneNumber: { type: new GraphQLNonNull(GraphQLInt)}
			},
			resolve(parent, args){
				// let person = new PersonSchema({
				// 	name: args.name,
				// 	email: args.email,
				// 	phoneNumber: args.phoneNumber
				// })
				// return person.save()
				return
			}
		}
	}
})

const schema = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation
})

export default schema