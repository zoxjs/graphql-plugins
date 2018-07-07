# GraphQL Plugins for Zox.js

```bash
npm i zox zox-plugins graphql-plugins
```

Zox.js was created with one goal in mind: **Making scalable systems**  
And this can easily be achieved using the `graphql-plugins`.

### Resolvers

Easily assign resolvers to fields.

```ts
@Resolver('Post', 'author', PostTypeDefs)
export class AuthorResolver implements IResolver
{
    public handle(source: Post, args, context, info: GraphQLResolveInfo): User
    {
        return users.find(u => u.id == source.user);
    }
}
```

### Top-Level Fields

Declare top-level fields anywhere in your code.

```ts
@Query('user(id: ID!): User', UserDef)
export class UserQuery extends ResolverBase
{
    public resolve(root, args, context): Array<UserData>
    {
        return users.find(u => u.id == args.id);
    }
}
```

### Subscriptions

Use Event Emitters as GraphQL Subscription endpoints
that can be accessed over a Web Socket.

```ts
@Subscription('post: Post', PostTypeDefs)
export class PostSubscription extends SubscriptionEventResolverBase
{
    public eventNames: Array<string> = [postCreated, postUpdates, postDeleted];
    public eventEmitter: EventEmitter = eventEmitter;
}
```
