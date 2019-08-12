import {UserDef} from "../User/User";
import {Node, NodeDef} from "../Node/Node";
import {DateDef} from "../../../lib/Plugins/DateScalar";

export type Post = {
    user: number
    text: string
    date: Date
} & Node;

// language=GraphQL
export const PostDef = `
type Post implements Node
{
  id: ID!
  user: User!
  text: String!
  date: Date!
}
`;

export const PostTypeDefs = [PostDef, UserDef, NodeDef, DateDef];
