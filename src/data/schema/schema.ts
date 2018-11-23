import { GraphQLID, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql'
import _ from 'lodash'

import { PersonSchema } from '../models/person'

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

const YMeetMeType = new GraphQLObjectType({
	name: 'YMeetMe',
	fields: () => ({
		profile: { type: GraphQLString }
	})
})

const SocialType = new GraphQLObjectType({
	name: 'Social',
	fields: () => ({
		ymeetme: { type: YMeetMeType }
	})
})

const PersonTypes = new GraphQLObjectType({
	name: 'Person',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		email: { type: GraphQLString },
		phoneNumber: { type: GraphQLInt },
		socialMedia: {type: new GraphQLList(SocialType) }
	})
})

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