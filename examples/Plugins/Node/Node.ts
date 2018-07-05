
export type Node = {
    id: number
};

export const NodeDef = `
interface Node {
  id: ID!
}

union PostOrUser = Post | User
`;
