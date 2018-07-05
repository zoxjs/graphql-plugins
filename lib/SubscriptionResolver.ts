import {GraphQLResolveInfo} from "graphql";
import {$$asyncIterator} from "iterall";
import {EventEmitter} from "events";

export interface ISubscriptionResolver<T = any, R = T>
{
    subscribe(source, args, context, info: GraphQLResolveInfo): AsyncIterator<T>;
    resolve(source, args, context, info: GraphQLResolveInfo): R;
}

export interface ISubscriptionEventFilter
{
    filterValue(value, source, args, context, info: GraphQLResolveInfo): boolean;
}

export type SubscriptionState = {
    done: boolean
}

export abstract class SubscriptionResolverBase<T = any, R = T, S extends SubscriptionState = SubscriptionState> implements ISubscriptionResolver<T, R>
{
    public subscribe(source, args, context, info: GraphQLResolveInfo): AsyncIterator<T>
    {
        const state: S = this.init(source, args, context, info);
        return {
            next: this.next.bind(this, state, source, args, context, info),
            return: this.return.bind(this, state, source, args, context, info),
            throw(error)
            {
                return Promise.reject(error);
            },
            [$$asyncIterator]()
            {
                return this;
            },
        };
    }

    public init(source, args, context, info: GraphQLResolveInfo): S
    {
        return { done: false } as S;
    }

    protected abstract next(state: S, source, args, context, info: GraphQLResolveInfo): Promise<IteratorResult<T>>;

    public return(state: S, source, args, context, info: GraphQLResolveInfo): Promise<IteratorResult<T>>
    {
        state.done = true;
        return Promise.resolve({ value: undefined, done: true });
    }

    public resolve(source: T, args: any, context: any, info: GraphQLResolveInfo): R
    {
        return source as any as R;
    }
}

export abstract class SubscriptionEventResolverBase<T = any, R = T> implements ISubscriptionResolver<T, R>, ISubscriptionEventFilter
{
    public abstract eventNames: Array<string>;
    public abstract eventEmitter: EventEmitter;

    public subscribe(source, args, context, info): AsyncIterator<T>
    {
        const pullQueue = [];
        const pushQueue = [];
        let listening = true;

        const pushValue = event =>
        {
            if (this.filterValue(event, source, args, context, info))
            {
                if (pullQueue.length !== 0)
                {
                    pullQueue.shift()({value: event, done: false});
                }
                else
                {
                    pushQueue.push(event);
                }
            }
        };

        const pullValue = () =>
        {
            return new Promise(resolve =>
            {
                if (pushQueue.length !== 0)
                {
                    resolve({ value: pushQueue.shift(), done: false });
                }
                else
                {
                    pullQueue.push(resolve);
                }
            });
        };

        const emptyQueue = () =>
        {
            if (listening)
            {
                listening = false;
                removeEventListeners();
                pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
                pullQueue.length = 0;
                pushQueue.length = 0;
            }
        };

        const addEventListeners = () =>
        {
            for (const eventName of this.eventNames)
            {
                this.eventEmitter.addListener(eventName, pushValue);
            }
        };

        const removeEventListeners = () =>
        {
            for (const eventName of this.eventNames)
            {
                this.eventEmitter.removeListener(eventName, pushValue);
            }
        };

        addEventListeners();

        return {
            next()
            {
                return listening ? pullValue() : this.return();
            },
            return()
            {
                emptyQueue();
                return Promise.resolve({ value: undefined, done: true });
            },
            throw(error)
            {
                emptyQueue();
                return Promise.reject(error);
            },
            [$$asyncIterator]()
            {
                return this;
            },
        };
    }

    public filterValue(value, source, args, context, info): boolean
    {
        return true;
    }

    public resolve(source: T, args, context, info): R
    {
        return source as any as R;
    }
}
