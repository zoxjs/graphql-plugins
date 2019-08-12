import {graphql, parse} from "graphql";
import {GraphQLSchema} from "graphql/type/schema";
import {SubscriptionManager} from "../lib/SubscriptionManager";
import {DocumentNode} from "graphql/language/ast";
import {GraphQLArgs} from "graphql/graphql";

export function testQuery(args: GraphQLArgs)
{
    graphql(args).then(result =>
    {
        // console.log(result);
        console.log(JSON.stringify(result, null, 2));
    });
}

export function testSubscription(schema: GraphQLSchema, document: DocumentNode)
{
    const subscriptionManager = new SubscriptionManager(schema);

    subscriptionManager.subscribe({document}, value =>
    {
        console.log('next.value', value);
    })
    .then(cancellationToken =>
    {
        setTimeout(() => {
            const res = cancellationToken();
            console.log('cancel', res);
        }, 3100);
    });
}

export function testList(schema: GraphQLSchema)
{
    // testQuery({schema, source: simpleQuery});
    // testQuery({schema, source: interfaceQuery});
    // testQuery({schema, source: unionQuery});
    // testQuery({schema, source: postSetDate, operationName: 'SetDate', variableValues: { date: 1528236000321 }});
    // testQuery({schema, source: postSetDate, operationName: 'GetNewList'});
    // testQuery({schema, source: reqexpSearch});
    // testQuery({schema, source: enumExample});
    testQuery({schema, source: itemExample});
    // testListSubscription(schema);
}

export function testListSubscription(schema: GraphQLSchema)
{
    testSubscription(schema, parse(postSubscription));
    setTimeout(() => testQuery({schema, source: postCreate}), 1000);
    setTimeout(() => testQuery({schema, source: postCreate}), 2000);
    setTimeout(() => testQuery({schema, source: postCreate}), 3000);
    setTimeout(() => testQuery({schema, source: postCreate}), 4000);
}

// language=GraphQL
const simpleQuery = `
{
  users(offset:1,limit:2) {
    id
  }
  user(id:1) {
    id
    name
    friends {
      name
    }
    posts {
      id
    }
  }
  posts {
    id
    text
    date
    user {
      name
    }
  }
}
`;

// language=GraphQL
const postCreate = `
mutation {
  op1: postCreate(user: 1, text: "Example text") {
    id
  }
  op2: postCreate(user: 1, text: "Example text") {
    id
  }
}
`;

// language=GraphQL
const postSetDate = `
mutation SetDate($date: Date!) {
  op1: postSetDate(id: 1, date: 1528236000123) {
    id
    date
  }
  op2: postSetDate(id: 2, date: $date) {
    id
    date
  }
}
query GetNewList {
  posts {
    id
    date
  }
}
`;

// language=GraphQL
const postSubscription = `
subscription {
  post(id: 4) {
    text
  }
}
`;

// language=GraphQL
const interfaceQuery = `
{
  postsAndUsersInterface {
    id
    ... on Post {
      text
      user {
        name
      }
    }
    ... on User {
      name
    }
  }
}
`;

// language=GraphQL
const unionQuery = `
{
  postsAndUsersUnion {
    ... on Post {
      id
      text
      user {
        name
      }
    }
    ... on User {
      id
      name
    }
  }
}
`;

// language=GraphQL
const reqexpSearch = `
{
  postsSearch(search: "/my/i") {
      id
      text
      user {
        name
      }
  }
}
`;

// language=GraphQL
const enumExample = `
{
  accessValue(access: ADMIN)
}
`;

// language=GraphQL
const itemExample = `
{
    items {
        id
        name
        uppercaseName
        lowercaseName
        related {
            id
            name
        }
    }
}
`;
