import {IScalar, PureScalar} from "../PluginManagers/ScalarPluginManager";
import {Kind, ObjectValueNode, ValueNode} from "graphql";

export const AnyDef = `
scalar Any
`;

@PureScalar('Any', AnyDef)
export class AnyScalar implements IScalar<any, any>
{
    public serialize = identity;
    public parseValue = identity;
    public parseLiteral = parseLiteral;
}

function identity(value)
{
    return value;
}

function parseLiteral(ast: ValueNode, variables?: { [p:string]: any }): any
{
    switch (ast.kind)
    {
        case Kind.STRING:
        case Kind.BOOLEAN:
            return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
            return parseFloat(ast.value);
        case Kind.OBJECT:
            return parseObject(ast, variables);
        case Kind.LIST:
            return ast.values.map(n => parseLiteral(n, variables));
        case Kind.NULL:
            return null;
        case Kind.VARIABLE:
            return variables ? variables[ast.name.value] : undefined;
    }
}

export function parseObject(ast: ObjectValueNode, variables?: { [p:string]: any })
{
    const value = {};
    for (const field of ast.fields)
    {
        value[field.name.value] = parseLiteral(field.value, variables);
    }
    return value;
}
