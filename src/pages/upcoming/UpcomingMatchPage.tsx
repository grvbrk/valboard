import {
  Devvit,
  StateSetter,
  useAsync,
  useInterval,
  useState,
  useWebView,
} from '@devvit/public-api';

import { getMatchInfoFromRedis, postMatchPageTypeToRedis } from 'src/redis/matches.js';
import { WebviewToBlockMessage, BlocksToWebviewMessage } from '@/shared.js';
import {
  generateAllPredictionsFromRedis,
  getUserPredsFromRedis,
  postUserPredToRedis,
} from 'src/redis/predictions.js';
import { MAPS } from 'src/utils/maps.js';
import { generatePlayerPickRates } from 'src/utils/predictionStats.js';
import { LivePreview, LivePreviewMobile } from 'src/components/LivePreview.js';
import { LoadingState } from 'src/components/Loading.js';
import { UpcomingPageTopBar } from './_components/desktop/Topbar.js';
import { UpcomingPageTopBarMobile } from './_components/mobile/Topbar.js';
import { UpcomingMatchInfo } from './_components/desktop/MatchInfo.js';
import { UpcomingMatchStats } from './_components/desktop/MatchStats.js';
import { UpcomingMatchInfoMobile } from './_components/mobile/MatchInfo.js';
import { UpcomingMatchStatsMobile } from './_components/mobile/MatchStats.js';
import { PredictionsMobile } from './_components/mobile/Predictions.js';
import { ErrorState } from 'src/components/Error.js';
import {
  PredictionType,
  AllUpcomingMatchSegment,
  SingleUpcomingMatchData,
  SingleUpcomingMatchSegment,
  PageType,
} from 'src/core/types.js';
import { getTimeRemaining } from 'src/utils/timeRemaining.js';

export const UpcomingMatchPage: Devvit.BlockComponent<{
  setPage: StateSetter<string | null>;
}> = (props, context) => {
  const { postId, userId, settings, ui, cache, redis } = context;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [predsSubmitted, setPredsSubmitted] = useState<boolean>(false);
  const [userPreds, setUserPreds] = useState<PredictionType | null>(null);
  const [allPreds] = useState<PredictionType[] | null>(async () => {
    const preds = await generateAllPredictionsFromRedis(redis, postId!);
    return preds;
  });

  const playerPickRates = generatePlayerPickRates(allPreds);

  async function updatePostPreview(context: Devvit.Context) {
    const post = await context.reddit.getPostById(postId!);
    const upcomingMatchInfo = JSON.parse(
      (await getMatchInfoFromRedis(redis, postId!)) as string
    ) as AllUpcomingMatchSegment;

    await post.setCustomPostPreview(() => {
      if (context.dimensions?.width! > 400) {
        return <LivePreview upcomingMatchInfo={upcomingMatchInfo} />;
      }
      return <LivePreviewMobile upcomingMatchInfo={upcomingMatchInfo} />;
    });
  }

  const {
    data: matchData,
    loading,
    error,
  } = useAsync(
    async () => {
      if (!postId || !userId) return null;

      const matchInfoStr = await getMatchInfoFromRedis(redis, postId);
      if (!matchInfoStr) return null;
      const { match_page } = JSON.parse(matchInfoStr) as {
        team1: string;
        team2: string;
        match_page: string;
      };

      const VALBOARD_URL = await settings.get('VALBOARD_URL');
      const url = `${VALBOARD_URL}/match/upcoming/single?url=${match_page}`;

      return await cache(
        async () => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              ui.showToast({
                text: 'Error fetching data...',
                appearance: 'neutral',
              });
              throw Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            const data = (await response.json()) as SingleUpcomingMatchData;

            const newData: SingleUpcomingMatchSegment = {
              team1: data.data.segments[0].team1,
              team2: data.data.segments[0].team2,
              logo1: await context.assets.getURL(
                `teams/${data.data.segments[0].logo1.replace('//owcdn.net/img/', '')}`
              ),
              logo2: await context.assets.getURL(
                `teams/${data.data.segments[0].logo2.replace('//owcdn.net/img/', '')}`
              ),
              team1_short: data.data.segments[0].team1_short,
              team2_short: data.data.segments[0].team2_short,
              players1: data.data.segments[0].players1,
              players2: data.data.segments[0].players2,
              match_series: data.data.segments[0].match_series,
              match_event: data.data.segments[0].match_event,
              event_logo: await context.assets.getURL(
                `teams/${data.data.segments[0].event_logo.replace('//owcdn.net/img/', '')}`
              ),
              match_date: data.data.segments[0].match_date,
              match_time: data.data.segments[0].match_time,
              unix_timestamp: data.data.segments[0].unix_timestamp,
              rounds: data.data.segments[0].rounds,
            };

            return newData;
          } catch (error) {
            console.error(error);
            ui.showToast({
              text: 'Something went wrong...',
              appearance: 'neutral',
            });
            return null;
          }
        },
        {
          key: `upcoming-${postId}`,
          ttl: 300000, // 5 min
        }
      );
    },
    {
      depends: [predsSubmitted],
      async finally(data, error) {
        if (error) {
          console.error('Failed to load data:', error);
        }
        if (data != null) {
          const userPreds = await getUserPredsFromRedis(redis, postId!, userId!);
          if (!userPreds) setUserPreds(null);
          else setUserPreds(JSON.parse(userPreds));
        }
      },
    }
  );

  if (error) return <ErrorState />;
  if (!matchData || loading) return <LoadingState />;

  const { timeLeft, hasTimeLeft } = getTimeRemaining(matchData.unix_timestamp);

  const interval = useInterval(() => {}, 1000);

  if (hasTimeLeft) {
    interval.start();
  } else {
    interval.stop();
    props.setPage(PageType.LIVE);
    postMatchPageTypeToRedis(redis, postId!, PageType.LIVE);
    updatePostPreview(context);
  }

  const { mount, unmount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
    onMessage: async (event, { postMessage }) => {
      const data = event as unknown as WebviewToBlockMessage;

      switch (data.type) {
        case 'INIT':
          const userPreds = await getUserPredsFromRedis(redis, postId!, userId!);
          postMessage({
            type: 'INIT_RESPONSE',
            payload: {
              postId: context.postId!,
              matchData: matchData,
              userPreds: userPreds ? JSON.parse(userPreds) : null,
            },
          });
          break;

        case 'SEND_USER_PREDS':
          unmount();
          await postUserPredToRedis(redis, postId!, userId!, data.payload);
          setPredsSubmitted(true);
          break;

        default:
          console.error('Unknown message type', data satisfies never);
          break;
      }
    },
  });

  return (
    <zstack width={'100%'} height={'100%'}>
      <hstack height={100} width={100}>
        {MAPS.map((map) => {
          return (
            <image
              url={`maps/${map}.png`}
              imageHeight={100}
              imageWidth={100}
              height={100}
              width={100}
              resizeMode="cover"
              grow
            />
          );
        })}
      </hstack>
      <vstack width={'100%'} height={'100%'}>
        {context.dimensions?.width! > 400 ? (
          <UpcomingPageTopBar matchData={matchData} />
        ) : (
          <UpcomingPageTopBarMobile matchData={matchData} />
        )}

        <spacer size="small" />

        {context.dimensions?.width! > 400 ? (
          <UpcomingMatchInfo matchData={matchData} timeLeft={timeLeft} userPreds={userPreds} />
        ) : (
          <UpcomingMatchInfoMobile
            matchData={matchData}
            timeLeft={timeLeft}
            userPreds={userPreds}
          />
        )}

        <spacer size="small" />

        {context.dimensions?.width! > 400 ? (
          <UpcomingMatchStats
            mount={mount}
            matchData={matchData}
            userPreds={userPreds}
            playerPickRates={playerPickRates}
          />
        ) : (
          <UpcomingMatchStatsMobile
            matchData={matchData}
            userPreds={userPreds}
            playerPickRates={playerPickRates}
          />
        )}

        {context.dimensions?.width! < 400 && (
          <PredictionsMobile mount={mount} userPreds={userPreds} />
        )}
      </vstack>
    </zstack>
  );
};
