import {IPluginSource, PluginDefinition, PluginSetup} from 'zox-plugins';
import {IClass, ResolverBuildOptions} from './ResolverPluginManager';
import {ValueNode} from 'graphql/language/ast';
import {Build} from './QueryPluginManager';

const pluginKey = Symbol('GraphQL Resolver Type');

export interface ScalarOptions
{
    name: string
    description?: string
    pure?: boolean
}

export interface IScalar<P = any, S= any>
{
    serialize(value: P): S | undefined | void;
    parseValue?(value: S): P | undefined | void;
    parseLiteral?(valueNode: ValueNode, variables?: { [p:string]: any }): P | undefined | void;
}

export class ScalarPluginManager
{
    protected readonly pluginDefinitions: Array<PluginDefinition<IClass<IScalar>, ScalarOptions>>;

    constructor(pluginDiscovery: IPluginSource)
    {
        this.pluginDefinitions = pluginDiscovery.getPlugins(pluginKey);
    }

    public getBuild(options?: ResolverBuildOptions): Build
    {
        options = options || {};
        let typeDef = '';
        const resolvers: { [key:string]: IScalar } = {};
        const resolverClassNames: { [type:string]: string } = {};
        for (const pluginDefinition of this.pluginDefinitions)
        {
            const name = pluginDefinition.data.name;
            const pure = pluginDefinition.data.pure;
            if (resolvers[name])
            {
                console.warn(
                    `Overriding scalar resolver for: ${name}
  new class: ${pluginDefinition.pluginClass.name}
  old class: ${resolverClassNames[name]}`);
            }
            const instance = new pluginDefinition.pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            resolvers[name] = {
                serialize: pure ? instance.serialize : instance.serialize.bind(instance),
            };
            if (instance.parseValue)
            {
                resolvers[name].parseValue = pure ? instance.parseValue : instance.parseValue.bind(instance);
            }
            if (instance.parseLiteral)
            {
                resolvers[name].parseLiteral = pure ? instance.parseLiteral : instance.parseLiteral.bind(instance);
            }
            resolverClassNames[name] = pluginDefinition.pluginClass.name;
            typeDef += `\n${pluginDefinition.data.description ? `#${pluginDefinition.data.description}\n` : ''}scalar ${name}\n`;
        }
        return {
            typeDef,
            resolvers,
        };
    }
}

export function Scalar(name: string, description?: string): (pluginClass: IClass<IScalar>) => void
export function Scalar(pluginClass: IClass<IScalar>): void
export function Scalar(nameOrClass: string | IClass<IScalar>, description?: string)
{
    if (typeof nameOrClass === 'string')
    {
        return PluginSetup<IScalar, ScalarOptions>(pluginKey, {name: nameOrClass, description});
    }
    PluginSetup<IScalar, ScalarOptions>(pluginKey, {name: nameOrClass.name})(nameOrClass);
}

export function PureScalar(name: string, description?: string): (pluginClass: IClass<IScalar>) => void
export function PureScalar(pluginClass: IClass<IScalar>): void
export function PureScalar(nameOrClass: string | IClass<IScalar>, description?: string)
{
    if (typeof nameOrClass === 'string')
    {
        return PluginSetup<IScalar, ScalarOptions>(pluginKey, {name: nameOrClass, description, pure: true});
    }
    PluginSetup<IScalar, ScalarOptions>(pluginKey, {name: nameOrClass.name, pure: true})(nameOrClass);
}
