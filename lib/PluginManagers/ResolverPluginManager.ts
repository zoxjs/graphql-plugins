import {PluginSetup} from 'zox-plugins';
import {IResolvers} from '../Interfaces';
import {TypeDefsOptions, TypeDefsPluginManager} from './TypeDefsPluginManager';
import {GraphQLResolveInfo} from 'graphql';

const pluginKey = Symbol('GraphQL Resolver');

export interface ResolverOptions extends TypeDefsOptions
{
    type: string
    field: string
}

export interface ResolverBuildOptions
{
    decorate?: (resolverClass: any) => void
}

export interface IClass<T>
{
    new (): T
}

export interface IResolver
{
    handle(source, args, context, info: GraphQLResolveInfo): any;
}

export class ResolverPluginManager extends TypeDefsPluginManager<IClass<IResolver>, ResolverOptions>
{
    public get pluginKey(): symbol
    {
        return pluginKey;
    }

    public getResolvers(options?: ResolverBuildOptions): IResolvers
    {
        options = options || {};
        const resolvers: IResolvers = {};
        const resolverClassNames: { [type:string]: {[field:string]: string } } = {};
        for (const pluginDefinition of this.pluginDefinitions)
        {
            if (!resolvers[pluginDefinition.data.type])
            {
                resolvers[pluginDefinition.data.type] = {};
                resolverClassNames[pluginDefinition.data.type] = {};
            }
            if (resolvers[pluginDefinition.data.type][pluginDefinition.data.field])
            {
                console.warn(
`Overriding field: ${pluginDefinition.data.type}.${pluginDefinition.data.field}
  new class: ${pluginDefinition.pluginClass.name}
  old class: ${resolverClassNames[pluginDefinition.data.type][pluginDefinition.data.field]}`);
            }
            const instance = new pluginDefinition.pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            resolvers[pluginDefinition.data.type][pluginDefinition.data.field] = instance.handle.bind(instance);
            resolverClassNames[pluginDefinition.data.type][pluginDefinition.data.field] = pluginDefinition.pluginClass.name;
        }
        return resolvers;
    }
}

export function Resolver(type: string, field: string, typeDefs?: string | Array<string>)
{
    return PluginSetup<IResolver, ResolverOptions>(pluginKey, {type, field, typeDefs});
}
