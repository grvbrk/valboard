import { WebviewToBlockMessage, BlocksToWebviewMessage } from '@/shared.js';
import { Devvit, useAsync, useChannel, useWebView } from '@devvit/public-api';
import { addInitialUserBalance } from './redis/trading.js';

function generateId(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

export const TradingPage: Devvit.BlockComponent = (_, context) => {
  const { postId, userId, settings, ui, cache, redis, reddit } = context;

  const { data: currentUser } = useAsync(async () => {
    const user = await context.reddit.getCurrentUser();
    const avatar = await context.reddit.getSnoovatarUrl(user!.username);
    return {
      sessionId: generateId(),
      userId: user!.id,
      name: user!.username,
      avatar: avatar ?? '',
    };
  });

  const { data: userBalance } = useAsync(async () => {
    const balance = await redis.get(`user:balance:${userId}`);
    await addInitialUserBalance(redis, userId!, 1000);
    // await removeUserBalance(redis, userId!);
    if (!balance) return null;
    return parseInt(balance);
  });

  const { mount, unmount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
    onMessage: async (event, { postMessage }) => {
      const data = event as unknown as WebviewToBlockMessage;

      switch (data.type) {
        case 'INIT':
          const marketData = await redis.get(`market:${postId}`);
          if (!marketData) return;

          postMessage({
            type: 'INIT_RESPONSE',
            payload: {
              postId: postId!,
              userBalance: userBalance!,
              market: JSON.parse(marketData),
            },
          });

          break;

        default:
          console.error('Unknown message type', data);
          break;
      }
    },
  });

  const tradeChannel = useChannel({
    name: 'Trade',
    onMessage: (data) => {},
    onSubscribed: () => {},
    onUnsubscribed: () => {},
  });

  return (
    <vstack height={'100%'} width={'100%'} alignment="center middle" gap="medium">
      <text>Current userBalance: {userBalance ?? 'null'}</text>
      <text onPress={mount}>open market</text>
    </vstack>
  );
};
