import {IScalar, Scalar} from "../PluginManagers/ScalarPluginManager";
import {Kind, ValueNode} from "graphql";

export const DateDef = `
scalar Date
`;

@Scalar('Date', DateDef)
export class DateScalar implements IScalar<Date, number>
{
    public serialize(value: Date): number
    {
        return value.valueOf();
    }

    public parseValue(value: number): Date | void
    {
        if (typeof value === 'number')
        {
            return new Date(value);
        }
    }

    public parseLiteral(valueNode: ValueNode, variables?: { [p:string]: any }): Date | void
    {
        if (valueNode.kind === Kind.INT)
        {
            const value = parseInt(valueNode.value);
            if (!isNaN(value))
            {
                return new Date(value);
            }
        }
    }
}
