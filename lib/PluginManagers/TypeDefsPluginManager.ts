import {PluginDefinition, IPluginSource} from "zox-plugins";

export type TypeDefsOptions = {
    typeDefs?: string | Array<string>
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
            if (typeof pluginDefinition.data.typeDefs === 'string')
            {
                if (typeDefs.indexOf(pluginDefinition.data.typeDefs) < 0)
                {
                    typeDefs.push(pluginDefinition.data.typeDefs);
                }
            }
            else if (typeof pluginDefinition.data.typeDefs !== 'undefined')
            {
                for (const typeDef of pluginDefinition.data.typeDefs)
                {
                    if (typeDefs.indexOf(typeDef) < 0)
                    {
                        typeDefs.push(typeDef);
                    }
                }
            }
        }
        return typeDefs;
    }
}
