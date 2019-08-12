import {
    GraphQLEnumType,
    GraphQLInterfaceType,
    GraphQLNamedType,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLUnionType
} from 'graphql/type/definition';
import {GraphQLSchema} from 'graphql/type/schema';
import {
    parse,
    buildASTSchema,
    Source,
    ParseOptions,
    BuildSchemaOptions,
    GraphQLTypeResolver
} from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import {IResolvers} from './Interfaces';
import {IScalar} from './PluginManagers/ScalarPluginManager';
import {mergeExtensions} from './mergeExtensions';

export function makeSchema(typeDefs: string, resolvers: IResolvers): GraphQLSchema
{
    const schema: GraphQLSchema = buildCompleteSchema(typeDefs);
    assignResolvers(schema, resolvers);
    return schema;
}

export function buildCompleteSchema(source: string | Source, options?: ParseOptions & BuildSchemaOptions): GraphQLSchema
{
    return buildASTSchema(mergeExtensions(parse(source, options)), options);
}

export function assignResolvers(schema: GraphQLSchema, resolvers: IResolvers): void
{
    const rTypeNames = Object.getOwnPropertyNames(resolvers);
    for (const typeName of rTypeNames)
    {
        const typeResolvers = resolvers[typeName];
        const type: Maybe<GraphQLNamedType> = schema.getType(typeName);
        if (type instanceof GraphQLObjectType)
        {
            const typeFields = type.getFields();
            const resolverNames = Object.getOwnPropertyNames(typeResolvers);
            for (const resolverName of resolverNames)
            {
                const resolver = typeResolvers[resolverName];
                const typeField = typeFields[resolverName];
                if (typeField)
                {
                    if (typeof resolver === 'function')
                    {
                        typeField.resolve = resolver;
                    }
                    else if (typeof resolver === 'object' && typeof resolver.resolve === 'function')
                    {
                        typeField.resolve = resolver.resolve;
                        typeField.subscribe = resolver.subscribe;
                    }
                    else
                    {
                        throw new Error('Invalid resolver of type: ' + typeof resolver);
                    }
                }
            }
    }
        else if (type instanceof GraphQLInterfaceType || type instanceof GraphQLUnionType)
        {
            type.resolveType = typeResolvers as GraphQLTypeResolver<any, any>;
        }
        else if (type instanceof GraphQLScalarType)
        {
            type.serialize = (typeResolvers as IScalar).serialize;
            if ((typeResolvers as IScalar).parseValue)
            {
                type.parseValue = (typeResolvers as IScalar).parseValue;
            }
            if ((typeResolvers as IScalar).parseLiteral)
            {
                type.parseLiteral = (typeResolvers as IScalar).parseLiteral;
            }
        }
        else if (type instanceof GraphQLEnumType)
        {
            const trNames = Object.getOwnPropertyNames(typeResolvers);
            for (const resolverName of trNames)
            {
                type.getValue(resolverName).value = typeResolvers[resolverName];
            }
        }
        else
        {
            console.warn('Unsupported resolver for type: ' + typeName);
        }
    }
}
