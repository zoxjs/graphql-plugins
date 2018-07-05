import {IScalar, Scalar} from "../PluginManagers/ScalarPluginManager";
import {Kind, ValueNode} from "graphql";

export const RegExpDef = `
scalar RegExp
`;

@Scalar('RegExp', RegExpDef)
export class RegExpScalar implements IScalar<RegExp, string>
{
    public serialize(value: RegExp): string
    {
        return value.toString();
    }

    public parseValue(value: string): RegExp
    {
        if (value[0] === '/')
        {
            const lastSlash = value.lastIndexOf('/');
            if (lastSlash > 0)
            {
                const pattern = value.substring(1, lastSlash);
                const flags = value.substring(lastSlash + 1);
                return RegExp(pattern, flags);
            }
        }
        return RegExp(value);
    }

    public parseLiteral(valueNode: ValueNode, variables?: { [p:string]: any }): RegExp | void
    {
        if (valueNode.kind === Kind.STRING)
        {
            return this.parseValue(valueNode.value);
        }
    }
}