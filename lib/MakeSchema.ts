import {
    GraphQLEnumType,
    GraphQLInterfaceType,
    GraphQLNamedType,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLUnionType
} from "graphql/type/definition";
import {GraphQLSchema} from "graphql/type/schema";
import {buildSchema, GraphQLTypeResolver} from "graphql";
import {IResolvers} from "./Interfaces";
import {IScalar} from "./PluginManagers/ScalarPluginManager";
import Maybe from "graphql/tsutils/Maybe";

export function makeSchema(typeDefs: string, resolvers: IResolvers<any, any>): GraphQLSchema
{
    const schema: GraphQLSchema = buildSchema(typeDefs);
    assignResolvers(schema, resolvers);
    return schema;
}

export function assignResolvers(schema: GraphQLSchema, resolvers: IResolvers<any, any>): void
{
    const rTypeNames = Object.getOwnPropertyNames(resolvers);
    for (const typeName of rTypeNames)
    {
        const typeResolvers = resolvers[typeName];
        const type: Maybe<GraphQLNamedType> = schema.getType(typeName);
        if (type instanceof GraphQLObjectType)
        {
            const trNames = Object.getOwnPropertyNames(typeResolvers);
            for (const resolverName of trNames)
            {
                const resolver = typeResolvers[resolverName];
                if (typeof resolver === 'function')
                {
                    type.getFields()[resolverName]['resolve'] = resolver;
                }
                else if (typeof resolver === 'object' && typeof resolver.resolve === 'function')
                {
                    type.getFields()[resolverName]['resolve'] = resolver.resolve;
                    type.getFields()[resolverName]['subscribe'] = resolver.subscribe;
                }
                else
                {
                    throw new Error('Invalid resolver of type: ' + typeof resolver);
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
