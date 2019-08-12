
export interface Item
{
    id: string;
    name: string;
    uppercaseName?: string;
    lowercaseName?: string;
    related?: Item[];
}

// language=GraphQL
export const itemDef = `
type Item
{
    id: ID!
    name: String!
    uppercaseName: String!
    lowercaseName: String!
    related: [Item]!
}
`;
