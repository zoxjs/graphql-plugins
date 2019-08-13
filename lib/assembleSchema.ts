import {IPluginSource} from 'zox-plugins';
import {GraphQLSchema} from 'graphql';
import {makeSchema} from './makeSchema';
import {
    MutationPluginManager,
    QueryPluginManager,
    SubscriptionPluginManager
} from './PluginManagers/QueryPluginManager';
import {ResolverBuildOptions, ResolverPluginManager} from './PluginManagers/ResolverPluginManager';
import {ResolveTypePluginManager} from './PluginManagers/ResolveTypePluginManager';
import {ScalarPluginManager} from './PluginManagers/ScalarPluginManager';
import {IResolvers} from './Interfaces';
import {EnumPluginManager} from './PluginManagers/EnumPluginManager';
import {ResolversPluginManager} from './PluginManagers/ResolversPluginManager';

export interface AssembledSchema extends AssembledSchemaData
{
    schema: GraphQLSchema
}

export interface AssembledSchemaData
{
    typeDefs: string,
    resolvers: IResolvers
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
    const resolversPluginManager = new ResolversPluginManager(pluginDiscovery);
    const interfacePluginManager = new ResolveTypePluginManager(pluginDiscovery);
    const scalarPluginManager = new ScalarPluginManager(pluginDiscovery);
    const enumPluginManager = new EnumPluginManager(pluginDiscovery);

    const queryDefinition = queryPluginManager.getBuild(options);
    const mutationDefinition = mutationPluginManager.getBuild(options);
    const subscriptionDefinition = subscriptionPluginManager.getBuild(options);
    const resolverDefinitions = resolverPluginManager.getResolvers(options);
    const resolversDefinition = resolversPluginManager.getBuild(options);
    const interfaceDefinitions = interfacePluginManager.getResolvers(options);
    const scalarDefinition = scalarPluginManager.getBuild(options);
    const enumDefinitions = enumPluginManager.getEnumDefs(options);

    const queriesSubTypeDefList = queryPluginManager.getTypeDefList();
    const mutationsSubTypeDefList = mutationPluginManager.getTypeDefList();
    const subscriptionsSubTypeDefList = subscriptionPluginManager.getTypeDefList();
    const resolverSubTypeDefList = resolverPluginManager.getTypeDefList();
    const resolversSubTypeDefList = resolversPluginManager.getTypeDefList();
    const interfaceSubTypeDefList = interfacePluginManager.getTypeDefList();

    const subTypeDefs = joinDistinct([
        queriesSubTypeDefList,
        mutationsSubTypeDefList,
        subscriptionsSubTypeDefList,
        resolverSubTypeDefList,
        resolversSubTypeDefList,
        interfaceSubTypeDefList,
        enumDefinitions.typeDefs,
    ]);

    const typeDefs =
        queryDefinition.typeDef +
        mutationDefinition.typeDef +
        subscriptionDefinition.typeDef +
        resolversDefinition.typeDef +
        scalarDefinition.typeDef +
        subTypeDefs;

    const resolvers = mergeResolvers(
        queryDefinition.resolvers,
        mutationDefinition.resolvers,
        subscriptionDefinition.resolvers,
        resolverDefinitions,
        resolversDefinition.resolvers,
        interfaceDefinitions,
        scalarDefinition.resolvers,
        enumDefinitions.values,
    );

    return {typeDefs, resolvers};
}

export function joinDistinct(typeDefLists: string[][]): string
{
    const typeDefs: string[] = [];
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

export function mergeResolvers(...resolversArr: IResolvers[]): IResolvers
{
    const result: IResolvers = {};
    let Query;
    let Mutation;
    for (const resolverGroup of resolversArr)
    {
        if (resolverGroup.Query)
        {
            Query = Query || {};
            Object.assign(Query, resolverGroup.Query);
        }
        if (resolverGroup.Mutation)
        {
            Mutation = Mutation || {};
            Object.assign(Mutation, resolverGroup.Mutation);
        }
    }
    Object.assign(result, ...resolversArr, {Query, Mutation});
    return result;
}
