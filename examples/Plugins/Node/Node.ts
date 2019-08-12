
export interface Node
{
    id: number
}

// language=GraphQL
export const NodeDef = `
interface Node {
  id: ID!
}

union PostOrUser = Post | User
`;
