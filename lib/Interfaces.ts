import {
    GraphQLResolveInfo,
    GraphQLTypeResolver,
} from 'graphql';
import {IScalar} from "./PluginManagers/ScalarPluginManager";

export interface IResolverOptions<TSource = any, TContext = any> {
    resolve?: IFieldResolver<TSource, TContext>;
    subscribe?: IFieldResolver<TSource, TContext>;
}

export type IFieldResolver<TSource = any, TContext = any> = (
    source: TSource,
    args: { [argument: string]: any; },
    context: TContext,
    info: GraphQLResolveInfo
) => any;

export type IResolverObject<TSource = any, TContext = any> = {
    [key: string]: IFieldResolver<TSource, TContext> | IResolverOptions;
};

export type IEnumResolver<T= any> = {
    [key: string]: T;
};

export interface IResolvers<TSource = any, TContext = any> {
    [key: string]:
        (() => any) |
        IResolverObject<TSource, TContext> |
        GraphQLTypeResolver<TSource, TContext> |
        IScalar |
        IEnumResolver;
}
