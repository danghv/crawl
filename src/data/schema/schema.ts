import { GraphQLID, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql'
import _ from 'lodash'
import { PersonTypes, StoryTypes, ContentStory } from './types'
import { PersonSchema } from '../models/person'
import { StorySchema } from '../models/story'

const fakeDatas = [
	{
		id: 'a',
		name: 'alice',
		mobilePhone: 'xxx',
		email: '',
		cmnd: ''
	},
	{
		id: 'b',
		name: 'bob',
		mobilePhone: 'yyy',
		email: '',
		cmnd: ''
	}
]

const RootQuery = new GraphQLObjectType({
	name: 'RootQuery',
	fields: {
		person: {
			type: PersonTypes,
			args: { id: { type: GraphQLID }},
			resolve(parent, args){
				return fakeDatas.filter(data => data.id === args.id)[0]
			}
		},
		persons: {
			type: new GraphQLList(PersonTypes),
			resolve(parent, args){
				return PersonSchema.find({})
			}
		},
		story: {
			type: StoryTypes,
			args: { name: { type: GraphQLString }, author: { type: GraphQLString }, id: { type: GraphQLID } },
			resolve(parent, args) {
				let story
				if (args.name && args.author) {
					story = StorySchema.findOne({name: args.name, author: args.author})
				}
				if (args.id) {
					story = StorySchema.findById(args.id)
				}
				return story
			}
		},
		stories: {
			type: GraphQLList(StoryTypes),
			args: { limit: {type: GraphQLInt }, category: { type: GraphQLString } },
			resolve(parent, args){
				const stories = StorySchema.find({}).limit(args.limit)
				return stories
			}
		},
		chapter: {
			type: ContentStory,
			args: { storyId: { type: GraphQLID }, storyName: { type: GraphQLString }, storyAuthor: { type: GraphQLString }, chapter: { type: GraphQLInt } },
			async resolve(parent, args) {
				let chapter
				if (args.storyId && args.chapter) {
					const story: any = await StorySchema.findById(args.storyId)
					chapter = story.content.filter(item => item.chapter === args.chapter)[0]
				}
				if (args.storyName && args.storyAuthor && args.chapter) {
					const story: any = await StorySchema.find({name: args.storyName, author: args.storyAuthor})
					chapter = story[0].content.filter(item => item.chapter === args.chapter)[0]
				}
				return chapter
			}
		},
		chapters: {
			type: GraphQLList(ContentStory),
			args: { storyId: { type: GraphQLID }, storyName: { type: GraphQLString }, storyAuthor: { type: GraphQLString } },
			async resolve(parent, args) {
				let chapters
				if (args.storyId) {
					const story: any = await StorySchema.findById(args.storyId)
					chapters = story.content
				}
				if (args.storyName && args.storyAuthor) {
					const story: any = await StorySchema.find({name: args.storyName, author: args.storyAuthor})
					chapters = story[0].content
				}
				return chapters
			}
		}
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
				let person = new PersonSchema({
					name: args.name,
					email: args.email,
					phoneNumber: args.phoneNumber
				})
				return person.save()
			}
		}
	}
})

const schema = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation
})

export default schema