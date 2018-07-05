import {GraphQLResolveInfo} from "graphql";
import {IResolver} from "./PluginManagers/ResolverPluginManager";

export interface IResolverAccess
{
    access(source, args, context, info: GraphQLResolveInfo): void;
}

export interface IResolverValidate
{
    validate(source, args, context, info: GraphQLResolveInfo): void;
}

export interface IResolverResolve
{
    resolve(source, args, context, info: GraphQLResolveInfo):  any;
}

export abstract class ResolverBase implements
    IResolver,
    IResolverAccess,
    IResolverValidate,
    IResolverResolve
{
    public handle(source, args, context, info)
    {
        this.access(source, args, context, info);
        this.validate(source, args, context, info);
        return this.resolve(source, args, context, info);
    }

    public access(source, args, context, info: GraphQLResolveInfo): void {}
    public validate(source, args, context, info: GraphQLResolveInfo): void {}

    public abstract resolve(source, args, context, info: GraphQLResolveInfo): any;
}
