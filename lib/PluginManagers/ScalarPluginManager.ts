import {PluginSetup} from "zox-plugins";
import {TypeDefsOptions, TypeDefsPluginManager} from "./TypeDefsPluginManager";
import {IClass, ResolverBuildOptions} from "./ResolverPluginManager";
import {ValueNode} from "graphql/language/ast";

const pluginKey = Symbol('GraphQL Resolver Type');

export type ScalarOptions = {
    name: string
} & TypeDefsOptions

export interface IScalar<P = any, S= any>
{
    serialize(value: P): S | undefined | void;
    parseValue?(value: S): P | undefined | void;
    parseLiteral?(valueNode: ValueNode, variables?: { [p:string]: any }): P | undefined | void;
}

export class ScalarPluginManager extends TypeDefsPluginManager<IClass<IScalar>, ScalarOptions>
{
    public get pluginKey(): symbol
    {
        return pluginKey;
    }

    public getResolvers(options?: ResolverBuildOptions): { [key:string]: IScalar }
    {
        options = options || {};
        const resolvers: { [key:string]: IScalar } = {};
        const resolverClassNames: { [type:string]: string } = {};
        for (const pluginDefinition of this.pluginDefinitions)
        {
            if (resolvers[pluginDefinition.data.name])
            {
                console.warn(
                    `Overriding scalar resolver for: ${pluginDefinition.data.name}
  new class: ${pluginDefinition.pluginClass.name}
  old class: ${resolverClassNames[pluginDefinition.data.name]}`);
            }
            const instance = new pluginDefinition.pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            resolvers[pluginDefinition.data.name] = {
                serialize: instance.serialize.bind(instance),
            };
            if (instance.parseValue)
            {
                resolvers[pluginDefinition.data.name].parseValue = instance.parseValue.bind(instance);
            }
            if (instance.parseLiteral)
            {
                resolvers[pluginDefinition.data.name].parseLiteral = instance.parseLiteral.bind(instance);
            }
            resolverClassNames[pluginDefinition.data.name] = pluginDefinition.pluginClass.name;
        }
        return resolvers;
    }
}

export function Scalar(name: string, typeDefs?: string | Array<string>)
{
    return PluginSetup<IScalar, ScalarOptions>(pluginKey, {name, typeDefs});
}
