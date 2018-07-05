import {users} from "./TestData";
import {GraphQLResolveInfo} from "graphql";
import {ResolverBase} from "../../../lib/ResolverBase";
import {User, UserTypeDefs} from "./User";
import {Resolver} from "../../../lib/PluginManagers/ResolverPluginManager";
import {Query} from "../../../lib/PluginManagers/QueryPluginManager";
import {Post} from "../Post/Post";
import {posts} from "../Post/TestData";

@Resolver('User', 'friends', UserTypeDefs)
export class FriendsResolver extends ResolverBase
{
    public resolve(source: User, args, context, info): Array<User>
    {
        console.log('User.friends.source', source.id);
        return users.filter(u => source.friends.indexOf(u.id) >= 0);
    }
}

@Resolver('User', 'posts', UserTypeDefs)
export class PostsResolver extends ResolverBase
{
    public resolve(source: User, args, context, info): Array<Post>
    {
        console.log('User.posts.source', source.id);
        return posts.filter(p => p.user == source.id);
    }
}

@Query('user(id: ID!): User', UserTypeDefs)
export class UserQuery extends ResolverBase
{
    public access(source, args, context, info: GraphQLResolveInfo)
    {
        console.log('Query user: check access');
    }

    public validate(source, args, context, info: GraphQLResolveInfo)
    {
        console.log('Query user: validate parameters');
    }

    public resolve(source, args, context, info: GraphQLResolveInfo): User
    {
        console.log('user.args', args);
        return users.find(u => u.id == args.id);
    }
}

@Query('users(offset: Int = 0, limit: Int = 25): [User]', UserTypeDefs)
export class UsersQuery extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Array<User>
    {
        console.log('users.args', args);
        return users.slice(args.offset, args.offset + args.limit);
    }
}
