import {Enum, IEnum} from "../../../lib/PluginManagers/EnumPluginManager";
import {ResolverBase} from "../../../lib/ResolverBase";
import {Query} from "../../../lib/PluginManagers/QueryPluginManager";
import {GraphQLResolveInfo} from "graphql";

@Enum('Access')
export class AccessEnum implements IEnum
{
    readonly values = {
        ANONYMOUS: 2,
        AUTHENTICATED: { value: 3 },
        ADMIN: () => 4,
    };
}

// return the same enum value
@Query('accessValue(access: Access!): Access!')
export class AccessValues extends ResolverBase
{
    public resolve(source, {access}, context, info: GraphQLResolveInfo)
    {
        return access;
    }
}
