import {ResolverBase} from "../../../lib/ResolverBase";
import {GraphQLResolveInfo} from "graphql";
import {User} from "../User/User";
import {users} from "../User/TestData";
import {Post, PostTypeDefs} from "./Post";
import {Resolver} from "../../../lib/PluginManagers/ResolverPluginManager";
import {Mutation, Query, Subscription} from "../../../lib/PluginManagers/QueryPluginManager";
import {posts} from "./TestData";
import {SubscriptionEventResolverBase} from "../../../lib/SubscriptionResolver";
import {EventEmitter} from "events";

@Resolver('Post', 'user', PostTypeDefs)
export class UserResolver extends ResolverBase
{
    public resolve(source: Post, args, context, info: GraphQLResolveInfo): User
    {
        console.log('Post.user.source', source.id);
        return users.find(u => u.id == source.user);
    }
}

@Query('posts(offset: Int = 0, limit: Int = 25): [Post]')
export class PostsQuery extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Array<Post>
    {
        console.log('posts.args', args);
        return posts.slice(args.offset, args.offset + args.limit);
    }
}

@Query('postsSearch(search: RegExp!): [Post]')
export class PostsSearchQuery extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Array<Post>
    {
        console.log('posts.args', args);
        return posts.filter(post => post.text.match(args.search));
    }
}

const postCreated = 'post_created';
const postUpdates = 'post_updates';
const postDeleted = 'post_deleted';

const eventEmitter: EventEmitter = new EventEmitter();

@Mutation('postCreate(user: ID, text: String): Post')
export class PostCreateMutation extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Post
    {
        console.log('postCreate:', args);
        const post: Post = {
            id: posts.length + 1,
            user: args.user,
            text: args.text,
            date: new Date(),
        };
        posts.push(post);
        eventEmitter.emit(postCreated, post);
        return post;
    }
}

@Mutation('postUpdate(id: ID!, text: String): Post')
export class PostUpdateMutation extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Post
    {
        console.log('postUpdate:', args);
        const post = posts.find(p => p.id == args.id);
        if (post)
        {
            post.text = args.text;
        }
        else
        {
            throw new Error(`Post ${args.id} does not exist.`);
        }
        eventEmitter.emit(postUpdates, post);
        return post;
    }
}

@Mutation('postSetDate(id: ID!, date: Date!): Post')
export class PostSetDateMutation extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Post
    {
        console.log('postSetDate:', args);
        const post = posts.find(p => p.id == args.id);
        if (post)
        {
            post.date = args.date;
        }
        else
        {
            throw new Error(`Post ${args.id} does not exist.`);
        }
        return post;
    }
}

@Mutation('postDelete(id: ID!): Post')
export class PostDeleteMutation extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Post
    {
        console.log('postDelete:', args);
        const postIndex = posts.findIndex(p => p.id == args.id);
        let post;
        if (postIndex >= 0)
        {
            post = posts[postIndex];
            posts.splice(postIndex, 1);
        }
        else
        {
            throw new Error(`Post ${args.id} does not exist.`);
        }
        eventEmitter.emit(postDeleted, post);
        return post;
    }
}

@Subscription('post(id: ID!): Post')
export class PostSubscription extends SubscriptionEventResolverBase
{
    public eventNames: Array<string> = [postCreated, postUpdates, postDeleted];
    public eventEmitter: EventEmitter = eventEmitter;

    public filterValue(value: Post, source, args, context, info: GraphQLResolveInfo): boolean
    {
        console.log('filterValue:', value, args);
        return !('id' in args) || value.id == args.id;
    }
}
