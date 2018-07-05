import {GraphQLResolveInfo} from "graphql";
import {NodeDef} from "./Node";
import {Query} from "../../../lib/PluginManagers/QueryPluginManager";
import {Post} from "../Post/Post";
import {posts} from "../Post/TestData";
import {ResolverBase} from "../../../lib/ResolverBase";
import {User} from "../User/User";
import {users} from "../User/TestData";
import {IResolveType, ResolveType} from "../../../lib/PluginManagers/ResolveTypePluginManager";

@ResolveType('Node', NodeDef)
export class ResolveNode implements IResolveType
{
    public resolve(value, context, info: GraphQLResolveInfo): string
    {
        return value.user ? 'Post' : 'User';
    }
}

@Query('postsAndUsersInterface: [Node]')
export class PostsAsNodesInterfaceQuery extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Array<any>
    {
        return (posts as any).concat(users as any);
    }
}

@ResolveType('PostOrUser', NodeDef)
export class ResolvePostOrUser implements IResolveType
{
    public resolve(value, context, info: GraphQLResolveInfo): string
    {
        return value.user ? 'Post' : 'User';
    }
}

@Query('postsAndUsersUnion: [PostOrUser]')
export class PostsAsNodesUnionQuery extends ResolverBase
{
    public resolve(source, args, context, info: GraphQLResolveInfo): Array<any>
    {
        return (posts as any).concat(users as any);
    }
}
