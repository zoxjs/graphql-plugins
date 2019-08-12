import {Constructor, PluginSetup} from 'zox-plugins';
import {TypeDefsOptions, TypeDefsPluginManager} from './TypeDefsPluginManager';
import {ResolverBuildOptions} from './ResolverPluginManager';
import {IFieldResolver} from '../Interfaces';
import {Build} from './QueryPluginManager';

const pluginKey = Symbol('GraphQL Type');
const queriesKey = Symbol('GraphQL Queries');
const mutationsKey = Symbol('GraphQL Mutations');
const fieldsKey = Symbol('GraphQL Fields');

interface ResolversOptions extends TypeDefsOptions
{
    type?: string;
}

export interface TypeResolverConstructor<T = any>
{
    new (): T;
    prototype: TypeResolverPrototype;
}
export interface TypeResolverPrototype
{
    [queriesKey]?: FieldDefinition[];
    [mutationsKey]?: FieldDefinition[];
    [fieldsKey]?: FieldDefinition[];
}

interface FieldDefinition
{
    propertyKey: string;
    field: string;
}

type IFieldResolverMap = {[field:string]: IFieldResolver<any, any>};

export class ResolversPluginManager extends TypeDefsPluginManager<TypeResolverConstructor, ResolversOptions>
{
    public get pluginKey(): symbol
    {
        return pluginKey;
    }

    public getBuild(options?: ResolverBuildOptions): Build
    {
        if (this.pluginDefinitions.length == 0)
        {
            return {typeDef: '', resolvers: {}};
        }
        options = options || {};
        const resolvers: {Query?: IFieldResolverMap, Mutation?: IFieldResolverMap} & {[field:string]: IFieldResolverMap} = {};
        const queries: IFieldResolverMap = {};
        const mutations: IFieldResolverMap = {};
        const queryFields: string[] = [];
        const mutationFields: string[] = [];
        for (const pluginDefinition of this.pluginDefinitions)
        {
            const pluginClass = pluginDefinition.pluginClass;
            const instance = new pluginClass();
            if (options.decorate)
            {
                options.decorate(instance);
            }
            const type = pluginDefinition.data.type || pluginClass.name;
            const staticFieldResolvers = pluginClass[fieldsKey];
            const fieldResolvers = pluginClass.prototype[fieldsKey];
            if (staticFieldResolvers || fieldResolvers)
            {
                const typeResolvers = resolvers[type] = resolvers[type] || {};
                if (staticFieldResolvers)
                {
                    for (const fieldResolver of staticFieldResolvers)
                    {
                        typeResolvers[fieldResolver.field] = pluginClass[fieldResolver.propertyKey];
                    }
                }
                if (fieldResolvers)
                {
                    for (const fieldResolver of fieldResolvers)
                    {
                        typeResolvers[fieldResolver.field] = instance[fieldResolver.propertyKey].bind(instance);
                    }
                }
            }
            function readFields(typeResolvers: IFieldResolverMap, fieldDefs: string[], fieldList: FieldDefinition[], isInstance?: boolean)
            {
                if (fieldList)
                {
                    for (const fieldDef of fieldList)
                    {
                        const field = fieldDef.field.trim();
                        let name = fieldDef.propertyKey;
                        let prependName = true;
                        let index = field.indexOf('(');
                        if (index >= 0)
                        {
                            const _name = field.substring(0, index).trim();
                            if (_name)
                            {
                                name = _name;
                                prependName = false;
                            }
                        }
                        else
                        {
                            index = field.indexOf(':');
                            if (index >= 0)
                            {
                                const _name = field.substring(0, index).trim();
                                if (_name)
                                {
                                    name = _name;
                                    prependName = false;
                                }
                            }
                        }
                        typeResolvers[name] = isInstance ? instance[fieldDef.propertyKey].bind(instance) : pluginClass[fieldDef.propertyKey];
                        fieldDefs.push(prependName ? field.includes('(') || field.startsWith(':') ? name + field : name + ': ' + field : field);
                    }
                }
            }
            readFields(queries, queryFields, pluginClass[queriesKey]);
            readFields(queries, queryFields, pluginClass.prototype[queriesKey], true);
            readFields(mutations, mutationFields, pluginClass[mutationsKey]);
            readFields(mutations, mutationFields, pluginClass.prototype[mutationsKey], true);
        }
        let typeDef = '';
        if (queryFields.length)
        {
            resolvers.Query = queries;
            typeDef += `\nextend type Query\n{\n${queryFields.join('\n')}\n}\n`;
        }
        if (mutationFields.length)
        {
            resolvers.Mutation = mutations;
            typeDef += `\nextend type Mutation\n{\n${mutationFields.join('\n')}\n}\n`;
        }
        return {typeDef, resolvers};
    }
}

export function Resolvers(pluginClass: Constructor<any>): void
export function Resolvers(options: ResolversOptions): (pluginClass: Constructor<any>) => void
export function Resolvers(optionsOrClass: ResolversOptions | Constructor<any>)
{
    if (typeof optionsOrClass === 'function')
    {
        PluginSetup<any, ResolversOptions>(pluginKey, {type: optionsOrClass.name})(optionsOrClass);
    }
    else
    {
        return PluginSetup<any, ResolversOptions>(pluginKey, optionsOrClass);
    }
}

export function query(field: string)
{
    return function _query(target, propertyKey: string)
    {
        requireFunction(target, propertyKey);
        if (!target[queriesKey])
        {
            target[queriesKey] = [];
        }
        target[queriesKey].push({propertyKey, field});
    }
}

export function mutation(field: string)
{
    return function _mutation(target, propertyKey: string)
    {
        requireFunction(target, propertyKey);
        if (!target[mutationsKey])
        {
            target[mutationsKey] = [];
        }
        target[mutationsKey].push({propertyKey, field});
    }
}

export function field(fieldName: string): (target, propertyKey: string) => void
export function field(target, propertyKey: string): void
export function field(fieldOrTarget: string | any, propertyKey?: string)
{
    const isString = typeof fieldOrTarget === 'string';
    const fieldName = isString ? fieldOrTarget : propertyKey;
    function _field(target: any, propertyKey: string)
    {
        requireFunction(target, propertyKey);
        if (!target[fieldsKey])
        {
            target[fieldsKey] = [];
        }
        target[fieldsKey].push({propertyKey, field: fieldName});
    }
    if (isString)
    {
        return _field;
    }
    _field(fieldOrTarget, propertyKey);
}

function requireFunction(target, propertyKey)
{
    if (typeof target[propertyKey] !== 'function')
    {
        throw new TypeError(`Property '${propertyKey}' on '${target.name}' is not a function`);
    }
}
