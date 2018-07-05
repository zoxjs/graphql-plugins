import {PluginSetup} from "zox-plugins";
import {TypeDefsOptions, TypeDefsPluginManager} from "./TypeDefsPluginManager";
import {GraphQLObjectType, GraphQLTypeResolver} from "graphql/type/definition";
import {IClass, ResolverBuildOptions} from "./ResolverPluginManager";
import Maybe from "graphql/tsutils/Maybe";
import {MaybePromise} from "graphql/jsutils/MaybePromise";
import {GraphQLResolveInfo} from "graphql";

const pluginKey = Symbol('GraphQL Resolver Type');

export type TypeResolverOptions = {
    name: string
} & TypeDefsOptions

export interface IResolveType
{
    resolve(value, context, info: GraphQLResolveInfo): MaybePromise<Maybe<GraphQLObjectType | string>>;
}

export class ResolveTypePluginManager extends TypeDefsPluginManager<IClass<IResolveType>, TypeResolverOptions>
{
    public get pluginKey(): symbol
    {
        return pluginKey;
    }

    public getResolvers(options?: ResolverBuildOptions): { [key:string]: GraphQLTypeResolver<any, any> }
    {
        options = options || {};
        const resolvers: { [key:string]: GraphQLTypeResolver<any, any> } = {};
        const resolverClassNames: { [type:string]: string } = {};
        for (const pluginDefinition of this.pluginDefinitions)
        {
            if (resolvers[pluginDefinition.data.name])
            {
                console.warn(
                    `Overriding type resolver for: ${pluginDefinition.data.name}
  new class: ${pluginDefinition.pluginClass.name}
  old class: ${resolverClassNames[pluginDefinition.data.name]}`);
            }
            const instance = new pluginDefinition.pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            resolvers[pluginDefinition.data.name] = instance.resolve.bind(instance);
            resolverClassNames[pluginDefinition.data.name] = pluginDefinition.pluginClass.name;
        }
        return resolvers;
    }
}

export function ResolveType(name: string, typeDefs?: string | Array<string>)
{
    return PluginSetup<IResolveType, TypeResolverOptions>(pluginKey, {name, typeDefs});
}
