import {
    GraphQLResolveInfo,
    GraphQLIsTypeOfFn,
    GraphQLTypeResolver,
    GraphQLScalarType,
} from 'graphql';
import {IScalar} from "./PluginManagers/ScalarPluginManager";

export interface IResolverOptions<TSource = any, TContext = any> {
    resolve?: IFieldResolver<TSource, TContext>;
    subscribe?: IFieldResolver<TSource, TContext>;
}

export type IFieldResolver<TSource, TContext> = (
    source: TSource,
    args: { [argument: string]: any; },
    context: TContext,
    info: GraphQLResolveInfo
) => any;

export type IResolverObject<TSource = any, TContext = any> = {
    [key: string]: IFieldResolver<TSource, TContext> | IResolverOptions;
};

export type IEnumResolver = {
    [key: string]: any;
};

export interface IResolvers<TSource = any, TContext = any> {
    [key: string]:
        (() => any) |
        IResolverObject<TSource, TContext> |
        GraphQLTypeResolver<any, any> |
        IScalar |
        IEnumResolver;
}
