import {Enum, IEnum} from '../../../lib/PluginManagers/EnumPluginManager';
import {ResolverBase} from '../../../lib/ResolverBase';
import {Query} from '../../../lib/PluginManagers/QueryPluginManager';
import {GraphQLResolveInfo} from 'graphql';

// export enum AccessVals
// {
//     ANONYMOUS= 2,
//     AUTHENTICATED= 6,
//     ADMIN = 8,
// }
//
// @Enum
// export class Access
// {
//     static readonly values = AccessVals;
// }

@Enum
export class Access
{
    static readonly values = {
        ANONYMOUS: 2,
        AUTHENTICATED: { value: 3 },
        ADMIN: () => 4,
    };
}

// @Enum
// export class Access implements IEnum
// {
//     readonly values = {
//         ANONYMOUS: 2,
//         AUTHENTICATED: { value: 3 },
//         ADMIN: () => 4,
//     };
// }

// return the same enum value
@Query('accessValue(access: Access!): Access!')
export class AccessValue extends ResolverBase
{
    public resolve(source, {access}, context, info: GraphQLResolveInfo)
    {
        console.log('Access: ' + access);
        return access;
    }
}
