import {IPluginSource} from "zox-plugins";
import {GraphQLSchema} from "graphql";
import {makeSchema} from "./MakeSchema";
import {
    MutationPluginManager,
    QueryPluginManager,
    SubscriptionPluginManager
} from "./PluginManagers/QueryPluginManager";
import {ResolverBuildOptions, ResolverPluginManager} from "./PluginManagers/ResolverPluginManager";
import {ResolveTypePluginManager} from "./PluginManagers/ResolveTypePluginManager";
import {ScalarPluginManager} from "./PluginManagers/ScalarPluginManager";
import {IResolvers} from "./Interfaces";
import {EnumPluginManager} from "./PluginManagers/EnumPluginManager";

export type AssembledSchema = {
    schema: GraphQLSchema
} & AssembledSchemaData

export type AssembledSchemaData = {
    typeDefs: string,
    resolvers: IResolvers<any, any>
}

export function assembleSchema(pluginDiscovery: IPluginSource, options?: ResolverBuildOptions): AssembledSchema
{
    const schemaData = assembleSchemaData(pluginDiscovery, options) as AssembledSchema;
    schemaData.schema = makeSchema(schemaData.typeDefs, schemaData.resolvers);
    return schemaData;
}

export function assembleSchemaData(pluginDiscovery: IPluginSource, options?: ResolverBuildOptions): AssembledSchemaData
{
    const queryPluginManager = new QueryPluginManager(pluginDiscovery);
    const mutationPluginManager = new MutationPluginManager(pluginDiscovery);
    const subscriptionPluginManager = new SubscriptionPluginManager(pluginDiscovery);
    const resolverPluginManager = new ResolverPluginManager(pluginDiscovery);
    const interfacePluginManager = new ResolveTypePluginManager(pluginDiscovery);
    const scalarPluginManager = new ScalarPluginManager(pluginDiscovery);
    const enumPluginManager = new EnumPluginManager(pluginDiscovery);

    const queryDefinition = queryPluginManager.getBuild(options);
    const mutationDefinition = mutationPluginManager.getBuild(options);
    const subscriptionDefinition = subscriptionPluginManager.getBuild(options);
    const resolverDefinitions = resolverPluginManager.getResolvers(options);
    const interfaceDefinitions = interfacePluginManager.getResolvers(options);
    const scalarDefinitions = scalarPluginManager.getResolvers(options);
    const enumDefinitions = enumPluginManager.getEnumDefs(options);

    const queriesSubTypeDefList = queryPluginManager.getTypeDefList();
    const mutationsSubTypeDefList = mutationPluginManager.getTypeDefList();
    const subscriptionsSubTypeDefList = subscriptionPluginManager.getTypeDefList();
    const resolversSubTypeDefList = resolverPluginManager.getTypeDefList();
    const interfaceSubTypeDefList = interfacePluginManager.getTypeDefList();
    const scalarSubTypeDefList = scalarPluginManager.getTypeDefList();

    const subTypeDefs = joinDistinct([
        queriesSubTypeDefList,
        mutationsSubTypeDefList,
        subscriptionsSubTypeDefList,
        resolversSubTypeDefList,
        interfaceSubTypeDefList,
        scalarSubTypeDefList,
        enumDefinitions.typeDefs,
    ]);

    const typeDefs =
        queryDefinition.typeDef +
        mutationDefinition.typeDef +
        subscriptionDefinition.typeDef +
        subTypeDefs;

    const resolvers = Object.assign({},
        queryDefinition.resolvers,
        mutationDefinition.resolvers,
        subscriptionDefinition.resolvers,
        resolverDefinitions,
        interfaceDefinitions,
        scalarDefinitions,
        enumDefinitions.values,
    );

    return { typeDefs, resolvers };
}

export function joinDistinct(typeDefLists: Array<Array<string>>): string
{
    const typeDefs: Array<string> = [];
    for (const list of typeDefLists)
    {
        for (const typeDef of list)
        {
            if (typeDefs.indexOf(typeDef) < 0)
            {
                typeDefs.push(typeDef);
            }
        }
    }
    return typeDefs.join('');
}
