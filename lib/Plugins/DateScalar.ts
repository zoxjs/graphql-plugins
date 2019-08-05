import {IScalar, Scalar} from "../PluginManagers/ScalarPluginManager";
import {Kind, ValueNode} from "graphql";

export const DateDef = `
scalar Date
`;

@Scalar('Date', DateDef)
export class DateScalar implements IScalar<Date, string>
{
    public serialize(value: Date): string
    {
        return value.toUTCString();
    }

    public parseValue(value: string): Date | void
    {
        if (typeof value === 'string')
        {
            return new Date(value);
        }
    }

    public parseLiteral(valueNode: ValueNode, variables?: { [p:string]: any }): Date | void
    {
        if (valueNode.kind === Kind.STRING)
        {
            const result = new Date(valueNode.value);
            if (isNaN(result.getTime()))
            {
                throw new TypeError('Invalid date');
            }
            if (valueNode.value !== result.toUTCString())
            {
                throw new TypeError('Invalid date format, only accepts: YYYY-MM-DDTHH:mm:ss.sssZ or ±YYYYYY-MM-DDTHH:mm:ss.sssZ');
            }
            return result;
        }
    }
}
