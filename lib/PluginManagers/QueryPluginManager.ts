import {PluginSetup} from "zox-plugins";
import {IResolverObject, IResolvers} from "../Interfaces";
import {TypeDefsOptions, TypeDefsPluginManager} from "./TypeDefsPluginManager";
import {ISubscriptionResolver} from "../SubscriptionResolver";
import {IClass, IResolver, ResolverBuildOptions} from "./ResolverPluginManager";
import {Lexer, Source} from "graphql";
import {createLexer} from "graphql/language";

const pluginKeyQuery = Symbol('GraphQL Query');
const pluginKeyMutation = Symbol('GraphQL Mutation');
const pluginKeySubscription = Symbol('GraphQL Subscription');

export type QueryOptions = {
    field: string
} & TypeDefsOptions

export type Build = {
    typeDef: string,
    resolvers: IResolvers<any, any>
};

export abstract class QueryPluginManagerBase<TResolver> extends TypeDefsPluginManager<IClass<TResolver>, QueryOptions>
{
    protected abstract type: string;

    public getBuild(options?: ResolverBuildOptions): Build
    {
        if (this.pluginDefinitions.length == 0)
        {
            return { typeDef: '', resolvers: {} };
        }
        options = options || {};
        const resolvers: IResolverObject<any, any> = {};
        const resolverClassNames: { [field:string]: string } = {};
        const queries: { [field:string]: string } = {};
        for (const pluginDefinition of this.pluginDefinitions)
        {
            const lexer: Lexer<{}> = createLexer(new Source(pluginDefinition.data.field), {});
            lexer.advance();
            if (lexer.token.kind !== 'Name')
            {
                console.error(`Invalid field definition on class ${pluginDefinition.pluginClass.name}`);
                continue;
            }
            const fieldName = lexer.token.value;
            if (resolvers[pluginDefinition.data.field])
            {
                console.warn(
`Overriding field: ${this.type}.${fieldName}
  new class: ${pluginDefinition.pluginClass.name}
  old class: ${resolverClassNames[fieldName]}
  new query: ${pluginDefinition.data.field}
  old query: ${queries[fieldName]}`);
            }
            const instance = new pluginDefinition.pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            resolvers[fieldName] = this.getResolver(instance);
            queries[fieldName] = pluginDefinition.data.field;
            resolverClassNames[fieldName] = pluginDefinition.pluginClass.name;
        }
        let fieldDefs: string = '';
        const fieldNames = Object.getOwnPropertyNames(queries);
        for (const field of fieldNames)
        {
            fieldDefs += queries[field] + '\n';
        }
        return {
            typeDef: `\ntype ${ this.type }\n{\n${ fieldDefs }}\n`,
            resolvers: {[this.type]: resolvers},
        };
    }

    protected abstract getResolver(instance: TResolver);
}

export class QueryPluginManager extends QueryPluginManagerBase<IResolver>
{
    protected type: string = 'Query';

    protected get pluginKey(): symbol
    {
        return pluginKeyQuery;
    }

    protected getResolver(instance: IResolver)
    {
        return instance.handle.bind(instance);
    }
}

export class MutationPluginManager extends QueryPluginManager
{
    protected type: string = 'Mutation';

    protected get pluginKey(): symbol
    {
        return pluginKeyMutation;
    }
}

export class SubscriptionPluginManager extends QueryPluginManagerBase<ISubscriptionResolver>
{
    protected type: string = 'Subscription';

    protected get pluginKey(): symbol
    {
        return pluginKeySubscription;
    }

    protected getResolver(instance: ISubscriptionResolver)
    {
        return {
            subscribe: instance.subscribe.bind(instance),
            resolve: instance.resolve.bind(instance),
        };
    }
}

export function Query(field: string, typeDefs?: string | Array<string>)
{
    return PluginSetup<IResolver, QueryOptions>(pluginKeyQuery, {field, typeDefs});
}

export function Mutation(field: string, typeDefs?: string | Array<string>)
{
    return PluginSetup<IResolver, QueryOptions>(pluginKeyMutation, {field, typeDefs});
}

export function Subscription(field: string, typeDefs?: string | Array<string>)
{
    return PluginSetup<ISubscriptionResolver, QueryOptions>(pluginKeySubscription, {field, typeDefs});
}
