import {IPluginSource, PluginDefinition, PluginSetup} from 'zox-plugins';
import {IClass, ResolverBuildOptions} from './ResolverPluginManager';

const pluginKey = Symbol('GraphQL Enum Type');

export interface EnumOptions
{
    name: string
    description?: string
}

export interface EnumDefs
{
    typeDefs: Array<string>
    values: { [key:string]: IEnum }
}

export type EnumClass<T extends Array<string> | Object = any> = IClass<IEnum> | (IClass & {values: T})

export interface IEnum<T extends Array<string> | Object = any>
{
    readonly values: T;
}

export class EnumPluginManager
{
    protected readonly pluginDefinitions: Array<PluginDefinition<EnumClass, EnumOptions>>;

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
            let mValues = (pluginDefinition.pluginClass as any).values;
            if (!mValues)
            {
                const instance = new pluginDefinition.pluginClass();
                if (options.decorate)
                {
                    options.decorate(instance);
                }
                mValues = instance.values;
            }
            if (typeof mValues === 'object')
            {
                const name = pluginDefinition.data.name || pluginDefinition.pluginClass.name;
                values[name] = mValues;
                let typeDef = '';
                const keys = Object.getOwnPropertyNames(mValues);
                for (const key of keys)
                {
                    typeDef += key + '\n';
                }
                typeDef = `\n${pluginDefinition.data.description ? `#${pluginDefinition.data.description}\n` : ''}enum ${name}\n{\n${typeDef}}\n`;
                typeDefs.push(typeDef);
            }
            else
            {
                console.warn('Expected enum values to be an object but got:', mValues);
            }
        }
        return {typeDefs, values};
    }
}

export function Enum(name: string, description?: string): (pluginClass: IClass<any>) => void
export function Enum(pluginClass: IClass<any>): void
export function Enum(nameOrClass: string | IClass<any>, description?: string)
{
    if (typeof nameOrClass === 'string')
    {
        return PluginSetup<IEnum, EnumOptions>(pluginKey, {name: nameOrClass, description});
    }
    PluginSetup<IEnum, EnumOptions>(pluginKey, {name: nameOrClass.name})(nameOrClass);
}
