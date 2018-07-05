import {IPluginSource, PluginDefinition, PluginSetup} from "zox-plugins";
import {IClass, ResolverBuildOptions} from "./ResolverPluginManager";

const pluginKey = Symbol('GraphQL Enum Type');

export type EnumDefs = {
    typeDefs: Array<string>
    values: { [key:string]: IEnum }
}

export interface IEnum<T extends object = any>
{
    readonly values: T;
}

export class EnumPluginManager
{
    protected readonly pluginDefinitions: Array<PluginDefinition<IClass<IEnum>, string>>;

    constructor(pluginDiscovery: IPluginSource)
    {
        this.pluginDefinitions = pluginDiscovery.getPlugins(pluginKey);
    }

    public getEnumDefs(options?: ResolverBuildOptions): EnumDefs
    {
        options = options || {};
        const typeDefs: Array<string> = [];
        const values: { [key:string]: IEnum } = {};
        for (const pluginDefinition of this.pluginDefinitions)
        {
            const instance = new pluginDefinition.pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            const mValues = instance.values;
            if (typeof mValues == 'object')
            {
                values[pluginDefinition.data] = mValues;
                let typeDef = '';
                const keys = Object.getOwnPropertyNames(mValues);
                for (const key of keys)
                {
                    typeDef += key + '\n';
                }
                typeDef = `\nenum ${ pluginDefinition.data }\n{\n${ typeDef }}\n`;
                typeDefs.push(typeDef);
            }
            else
            {
                console.warn('Expected enum values to be an object but got:', mValues);
            }
        }
        return { typeDefs, values };
    }
}

export function Enum(name: string)
{
    return PluginSetup<IEnum, string>(pluginKey, name);
}
