import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql'
import { StorySchema } from '../models/story'

export const YMeetMeType = new GraphQLObjectType({
	name: 'YMeetMe',
	fields: () => ({
		profile: { type: GraphQLString }
	})
})

export const SocialType = new GraphQLObjectType({
	name: 'Social',
	fields: () => ({
		ymeetme: { type: YMeetMeType }
	})
})

export const PersonTypes = new GraphQLObjectType({
	name: 'Person',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		email: { type: GraphQLString },
		phoneNumber: { type: GraphQLInt },
		socialMedia: {type: new GraphQLList(SocialType) }
	})
})

export const Content = new GraphQLObjectType({
	name: 'Content',
	fields: () => ({
		chapter: { type: GraphQLInt },
		title: { type: GraphQLString },
		text: { type: GraphQLString }
	})
})

export const ContentStory = new GraphQLObjectType({
	name: 'ContentStory',
	fields: () => ({
		content: { type: new GraphQLList(Content)}
	})
})

export const StoryTypes = new GraphQLObjectType({
	name: 'Story',
	fields: () => ({
		id: { type: GraphQLID },
		thumbnail: { type: new GraphQLList(GraphQLString) },
		linkToCrawl: { type: new GraphQLList(GraphQLString) },
		name: { type: GraphQLString },
		label: { type: GraphQLString },
		author: { type: GraphQLString },
		chapters: { type: GraphQLInt },
		category: { type: new GraphQLList(GraphQLString) },
		status: { type: GraphQLString },
		contentId: { type: GraphQLString }
	})
})