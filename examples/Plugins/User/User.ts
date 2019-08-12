import {PostDef} from "../Post/Post";
import {Node, NodeDef} from "../Node/Node";

export type User = {
    name: string
    friends: Array<number>
} & Node;

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
