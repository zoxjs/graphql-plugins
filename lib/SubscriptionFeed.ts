import {ExecutionResult, subscribe} from "graphql";
import {CancellationToken, SubscribeArgsFull} from "./SubscriptionManager";

export function createSubscriptionFeed(args: SubscribeArgsFull, feedHandler: (any) => void): Promise<CancellationToken>
{
    return subscribe(args).then((subscription: AsyncIterator<ExecutionResult>) =>
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
        return subscription.return.bind(subscription);
    });
}
