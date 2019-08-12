import {PostDef} from '../Post/Post';
import {Node, NodeDef} from '../Node/Node';

export interface User extends Node
{
    name: string
    friends: Array<number>
}

// language=GraphQL
export const UserDef = `
type User implements Node
{
  id: ID!
  name: String
  friends: [User]
  posts: [Post]
}
`;

export const UserTypeDefs = [UserDef, PostDef, NodeDef];
