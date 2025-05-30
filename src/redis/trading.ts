import { RedisClient } from '@devvit/public-api';
import { AllUpcomingMatchSegment } from 'src/core/types.js';

export async function createMatchMarket(
  redis: RedisClient,
  postId: string,
  upcomingMatchInfo: AllUpcomingMatchSegment
) {
  const marketExists = await redis.exists(`market:${postId}`);
  if (marketExists) return;

  const market = {
    id: postId,
    title: `${upcomingMatchInfo.team1} vs. ${upcomingMatchInfo.team2}`,
    description: upcomingMatchInfo.match_series,
    team1: upcomingMatchInfo.team1,
    team2: upcomingMatchInfo.team2,
    team1Price: 0.5,
    team2Price: 0.5,
    team1Shares: 0,
    team2Shares: 0,
    priceHistory: [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        team1Price: 0.5,
        team2Price: 0.5,
        balance: 0,
      },
    ],
  };

  await redis.set(`market:${postId}`, JSON.stringify(market));
  console.log('Market created!');
  // await redis.expire(`market:${postId}`, 86400); // 1 day
}

export async function addInitialUserBalance(redis: RedisClient, userId: string, balance: number) {
  await redis.set(`user:balance:${userId}`, String(balance));
}

export async function removeUserBalance(redis: RedisClient, userId: string) {
  await redis.set(`user:balance:${userId}`, '0');
}
