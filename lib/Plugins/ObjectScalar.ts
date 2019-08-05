import {IScalar, PureScalar} from "../PluginManagers/ScalarPluginManager";
import {Kind, ValueNode} from "graphql";
import {parseObject} from "./AnyScalar";

export const ObjectDef = `
scalar Object
`;

@PureScalar('Object', ObjectDef)
export class ObjectScalar implements IScalar<Object, Object>
{
    public serialize = ensureObject;
    public parseValue = ensureObject;

    public parseLiteral(ast: ValueNode, variables?: { [p:string]: any }): Object | void
    {
        if (ast.kind === Kind.OBJECT)
        {
            return parseObject(ast, variables);
        }
    }
}

function ensureObject(value: Object): Object
{
    if (typeof value !== 'object' || value === null || Array.isArray(value))
    {
        throw new TypeError(`Object cannot represent non-object value: '${value}'`);
    }
    return value;
}
