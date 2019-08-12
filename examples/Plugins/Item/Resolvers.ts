import {field, mutation, query, Resolvers} from '../../../lib/PluginManagers/ResolversPluginManager';
import {Item, itemDef} from './Item';
import {items} from './TestData';

@Resolvers({type: 'Item', typeDefs: itemDef})
export class ItemResolvers
{
    private data = items;

    @field
    static uppercaseName(item: Item)
    {
        return item.name.toUpperCase();
    }

    @field('lowercaseName')
    static lowercase(item: Item)
    {
        return item.name.toLowerCase();
    }

    @field
    related(item: Item)
    {
        return [this.data[0]];
    }

    @query('[Item!]!')
    items(): Item[]
    {
        return this.data;
    }

    @mutation('(name: String!): Item')
    static addItem(root, {name}): Item
    {
        const item: Item = {
            id: Math.random().toString(),
            name: name,
        };
        items.push(item);
        return item;
    }
}
