import {Kind, DefinitionNode, DocumentNode, Location} from 'graphql';

const byKindGetInfo: {[kind: string]: (def) => {isExtension: boolean, type: string, typeName: string}} = {
    // SchemaDefinition
    [Kind.SCHEMA_DEFINITION]: () => ({
        isExtension: false,
        type: 'schema',
        typeName: 'schema',
    }),
    // ScalarTypeDefinition
    [Kind.SCALAR_TYPE_DEFINITION]: def => ({
        isExtension: false,
        type: 'scalar',
        typeName: `scalar ${def.name.value}`,
    }),
    // ObjectTypeDefinition
    [Kind.OBJECT_TYPE_DEFINITION]: def => ({
        isExtension: false,
        type: 'type',
        typeName: `type ${def.name.value}`,
    }),
    // InterfaceTypeDefinition
    [Kind.INTERFACE_TYPE_DEFINITION]: def => ({
        isExtension: false,
        type: 'interface',
        typeName: `interface ${def.name.value}`,
    }),
    // UnionTypeDefinition
    [Kind.UNION_TYPE_DEFINITION]: def => ({
        isExtension: false,
        type: 'union',
        typeName: `union ${def.name.value}`,
    }),
    // EnumTypeDefinition
    [Kind.ENUM_TYPE_DEFINITION]: def => ({
        isExtension: false,
        type: 'enum',
        typeName: `enum ${def.name.value}`,
    }),
    // InputObjectTypeDefinition
    [Kind.INPUT_OBJECT_TYPE_DEFINITION]: def => ({
        isExtension: false,
        type: 'input',
        typeName: `input ${def.name.value}`,
    }),
    // DirectiveDefinition
    [Kind.DIRECTIVE_DEFINITION]: def => ({
        isExtension: false,
        type: 'directive',
        typeName: `directive ${def.name.value}`,
    }),

    // SchemaExtension
    [Kind.SCHEMA_EXTENSION]: () => ({
        isExtension: true,
        type: 'schema',
        typeName: 'schema',
    }),
    // ScalarTypeExtension
    [Kind.SCALAR_TYPE_EXTENSION]: def => ({
        isExtension: true,
        type: 'scalar',
        typeName: `scalar ${def.name.value}`,
    }),
    // ObjectTypeExtension
    [Kind.OBJECT_TYPE_EXTENSION]: def => ({
        isExtension: true,
        type: 'type',
        typeName: `type ${def.name.value}`,
    }),
    // InterfaceTypeExtension
    [Kind.INTERFACE_TYPE_EXTENSION]: def => ({
        isExtension: true,
        type: 'interface',
        typeName: `interface ${def.name.value}`,
    }),
    // UnionTypeExtension
    [Kind.UNION_TYPE_EXTENSION]: def => ({
        isExtension: true,
        type: 'union',
        typeName: `union ${def.name.value}`,
    }),
    // EnumTypeExtension
    [Kind.ENUM_TYPE_EXTENSION]: def => ({
        isExtension: true,
        type: 'enum',
        typeName: `enum ${def.name.value}`,
    }),
    // InputObjectTypeExtension
    [Kind.INPUT_OBJECT_TYPE_EXTENSION]: def => ({
        isExtension: true,
        type: 'input',
        typeName: `input ${def.name.value}`,
    }),
};

interface LocationExt extends Location
{
    readonly ext?: Location[]
}

function extendLocation(loc: LocationExt, loc2: Location): LocationExt
{
    return {
        ...loc,
        ext: loc.ext ? [...loc.ext, loc2] : [loc2],
    };
}

function extendDefinition(def, ext)
{
    const defInfo = byKindGetInfo[def.kind](def);
    const extInfo = byKindGetInfo[ext.kind](ext);
    if (defInfo.type !== extInfo.type)
    {
        throw new Error(`Types must be same: ${defInfo.type} != ${extInfo.type}`);
    }
    if (defInfo.isExtension)
    {
        throw new Error('Extended type must be definition type');
    }
    if (!extInfo.isExtension)
    {
        throw new Error('Extending type must be extension type');
    }

    switch (defInfo.type) {
        case 'schema':
            return {
                ...def,
                directives: [...def.directives, ...ext.directives],
                operationTypes: [...def.operationTypes, ...ext.operationTypes],
                loc: extendLocation(def.loc, ext.loc),
            };
        case 'scalar':
            return {
                ...def,
                directives: [...def.directives, ...ext.directives],
                loc: extendLocation(def.loc, ext.loc),
            };
        case 'type':
            return {
                ...def,
                interfaces: [...def.interfaces, ...ext.interfaces],
                directives: [...def.directives, ...ext.directives],
                fields: [...def.fields, ...ext.fields],
                loc: extendLocation(def.loc, ext.loc),
            };
        case 'interface':
            return {
                ...def,
                directives: [...def.directives, ...ext.directives],
                fields: [...def.fields, ...ext.fields],
                loc: extendLocation(def.loc, ext.loc),
            };
        case 'union':
            return {
                ...def,
                directives: [...def.directives, ...ext.directives],
                types: [...def.types, ...ext.types],
                loc: extendLocation(def.loc, ext.loc),
            };
        case 'enum':
            return {
                ...def,
                directives: [...def.directives, ...ext.directives],
                values: [...def.values, ...ext.values],
                loc: extendLocation(def.loc, ext.loc),
            };
        case 'input':
            return {
                ...def,
                directives: [...def.directives, ...ext.directives],
                fields: [...def.fields, ...ext.fields],
                loc: extendLocation(def.loc, ext.loc),
            };
        default:
            console.warn('Unhandled type for merge: ' + defInfo.type);
            return def;
    }
}

export function mergeExtensions(document: DocumentNode): DocumentNode
{
    const definitions = new Map<string, DefinitionNode>();
    const extensions = new Map<string, DefinitionNode[]>();

    for(const def of document.definitions)
    {
        if (!def)
        {
            throw new Error('Definition expected');
        }
        const getKey = byKindGetInfo[def.kind];
        if (!getKey)
        {
            console.warn('Cannot retrieve key for ' + def.kind);
            continue;
        }
        const {isExtension, typeName} = getKey(def);
        if (isExtension)
        {
            if (extensions.has(typeName))
            {
                extensions.get(typeName).push(def);
            }
            else
            {
                extensions.set(typeName, [def]);
            }
        }
        else
        {
            if (definitions.has(typeName))
            {
                throw new Error(`Schema cannot contain multiple definitions: '${typeName}'`);
            }
            definitions.set(typeName, def);
        }
    }

    for (const [key, extDefs] of extensions)
    {
        const def = definitions.get(key);
        definitions.set(key, extDefs.reduce(extendDefinition, def));
    }

    return {
        ...document,
        definitions: [...definitions.values()],
    };
}
