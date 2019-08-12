import {PluginDefinition, IPluginSource} from 'zox-plugins';

export type MaybeDeepArray<T> = T | T[] | T[][] | T[][][]

export interface TypeDefsOptions
{
    typeDefs?: MaybeDeepArray<string>;
}

export abstract class TypeDefsPluginManager<TPlugin, TData>
{
    protected get pluginKey(): symbol { return undefined; }

    protected readonly pluginDefinitions: Array<PluginDefinition<TPlugin, TData & TypeDefsOptions>>;

    constructor(pluginDiscovery: IPluginSource)
    {
        this.pluginDefinitions = pluginDiscovery.getPlugins(this.pluginKey);
    }

    public getTypeDefList(): Array<string>
    {
        const typeDefs: Array<string> = [];
        for (const pluginDefinition of this.pluginDefinitions)
        {
            flatForEach(pluginDefinition.data.typeDefs, typeDef =>
            {
                if (typeDefs.indexOf(typeDef) < 0)
                {
                    typeDefs.push(typeDef);
                }
            });
        }
        return typeDefs;
    }
}

function flatForEach<T>(arr: MaybeDeepArray<T>, callback: (item: T) => void)
{
    if ((Array.isArray(arr)))
    {
        for (const item of arr)
        {
            flatForEach(item, callback);
        }
    }
    else
    {
        callback(arr);
    }
}
