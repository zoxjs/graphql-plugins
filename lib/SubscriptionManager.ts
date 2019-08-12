import {ExecutionResult, GraphQLSchema, subscribe} from 'graphql';
import {GraphQLFieldResolver} from 'graphql/type/definition';
import {DocumentNode} from 'graphql/language/ast';
import Maybe from 'graphql/tsutils/Maybe';

// returns false if already canceled
export type CancellationToken = () => boolean;

export interface SubscribeArgs
{
    document: DocumentNode
    rootValue?: any
    contextValue?: any
    variableValues?: Maybe<{ [key: string]: any }>
    operationName?: Maybe<string>
    fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>
    subscribeFieldResolver?: Maybe<GraphQLFieldResolver<any, any>>
}

export interface SubscribeArgsFull extends SubscribeArgs
{
    schema: GraphQLSchema
}

export class SubscriptionManager
{
    private readonly schema: GraphQLSchema;
    private subscriptions: Array<AsyncIterator<ExecutionResult>> = [];

    constructor(schema: GraphQLSchema)
    {
        this.schema = schema;
    }

    public subscribe(args: SubscribeArgs, feedHandler: (any) => void): Promise<CancellationToken>
    {
        (args as SubscribeArgsFull).schema = this.schema;
        return subscribe((args as SubscribeArgsFull))
        .then((subscription: AsyncIterator<ExecutionResult>) =>
        {
            console.log('subscribed');
            const handleNext = next =>
            {
                feedHandler(next);
                if (!next.done)
                {
                    subscription.next().then(handleNext);
                }
            };
            subscription.next().then(handleNext);
            this.subscriptions.push(subscription);
            return () =>
            {
                const index = this.subscriptions.indexOf(subscription);
                const exists = index >= 0;
                if (exists)
                {
                    subscription.return();
                    this.subscriptions.splice(index, 1);
                }
                return exists;
            };
        });
    }

    public unsubscribeAll()
    {
        for (const subscription of this.subscriptions)
        {
            subscription.return();
        }
        this.subscriptions.length = 0;
    }
}
