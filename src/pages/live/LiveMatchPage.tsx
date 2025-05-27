import { Devvit, StateSetter, useAsync, useInterval, useState } from '@devvit/public-api';
import {
  AllMatchResultSegment,
  AllUpcomingMatchSegment,
  PageType,
  SingleLiveMatchData,
} from 'src/core/types.js';
import { getMatchInfoFromRedis, postMatchPageTypeToRedis } from 'src/redis/matches.js';

import { MAPS } from 'src/utils/maps.js';
import { ResultsPreview, ResultsPreviewMobile } from 'src/components/ResultsPreview.js';
import { LoadingState } from 'src/components/Loading.js';
import { ErrorState } from 'src/components/Error.js';
import { LivePageTopBar } from './_components/desktop/Topbar.js';
import { LivePageTopBarMobile } from './_components/mobile/Topbar.js';
import { LiveMatchInfo } from './_components/desktop/MatchInfo.js';
import { LiveMatchStats } from './_components/desktop/MatchStats.js';
import { OptionsBar } from './_components/desktop/OptionsBar.js';
import { LiveMatchInfoMobile } from './_components/mobile/MatchInfo.js';
import { LiveMatchStatsMobile } from './_components/mobile/MatchStats.js';
import { OptionsBarMobile } from './_components/mobile/OptionsBar.js';

export const LiveMatchPage: Devvit.BlockComponent<{
  setPage: StateSetter<string | null>;
}> = (props, context) => {
  const { postId, userId, settings, ui, cache, redis } = context;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [bgMaps, setBgMaps] = useState<{ name: string; show: boolean }[]>(
    MAPS.map((map) => {
      return { name: map, show: true };
    })
  );

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  async function updatePostPreview() {
    const post = await context.reddit.getPostById(postId!);
    const upcomingMatchInfo = JSON.parse(
      (await getMatchInfoFromRedis(redis, postId!)) as string
    ) as AllUpcomingMatchSegment;

    await post.setCustomPostPreview(() => {
      if (context.dimensions?.width! > 400) {
        return (
          <ResultsPreview
            upcomingMatchInfo={upcomingMatchInfo as unknown as AllMatchResultSegment}
          />
        );
      }
      return (
        <ResultsPreviewMobile
          upcomingMatchInfo={upcomingMatchInfo as unknown as AllMatchResultSegment}
        />
      );
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
      const url = `${VALBOARD_URL}/match/live/single?url=${match_page}`;

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
            const data = (await response.json()) as SingleLiveMatchData;
            if (data.data.status != 200) {
              throw Error(`Error! Status code: ${data.data.status}`);
            }
            return data;
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
          key: `live-${postId}`,
          ttl: 60000, // 1 min
        }
      );
    },
    {
      depends: [refreshTrigger],
      finally(data, error) {
        if (error) {
          console.error('Failed to load data:', error);
          return null;
        }
        if (data != null) {
          if (!data.data.is_live) {
            props.setPage(PageType.RESULTS);
            postMatchPageTypeToRedis(redis, postId!, PageType.RESULTS);
            updatePostPreview();
            return null;
          }
          const newBgMaps = data.data.segments[0].rounds
            .filter((r) => r.map_name)
            .map((map) => {
              return { name: map.map_name, show: true };
            }) as { name: string; show: boolean }[];
          setBgMaps(newBgMaps);
        }
      },
    }
  );

  if (error) return <ErrorState />;
  if (!matchData || loading) return <LoadingState />;

  const interval = useInterval(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, 60000); // 1 min

  if (matchData.data.is_live) {
    interval.start();
  } else {
    interval.stop();
  }

  return (
    <zstack width={'100%'} height={'100%'}>
      <hstack height={100} width={100}>
        {bgMaps.map(
          (map) =>
            map.show && (
              <image
                url={`maps/${map.name === 'TBD' ? 'Haven' : map.name}.png`}
                imageHeight={100}
                imageWidth={100}
                height={100}
                width={100}
                resizeMode="cover"
                grow
              />
            )
        )}
      </hstack>
      <vstack width={'100%'} height={'100%'}>
        {context.dimensions?.width! > 500 ? (
          <LivePageTopBar matchData={matchData.data.segments[0]} />
        ) : (
          <LivePageTopBarMobile matchData={matchData.data.segments[0]} />
        )}

        {context.dimensions?.width! > 500 ? (
          <LiveMatchInfo
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        ) : (
          <LiveMatchInfoMobile
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        )}

        <spacer size="small" />

        <vstack width="100%" alignment="center middle">
          <text alignment="center middle" color={'grey'} size={`xsmall`} width={80} wrap>
            {matchData.data.segments[0].team_picks}
          </text>
        </vstack>

        <spacer size="small" />

        {context.dimensions?.width! > 500 ? (
          <OptionsBar
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
            setSelectedTabIndex={setSelectedTabIndex}
            setBgMaps={setBgMaps}
          />
        ) : (
          <OptionsBarMobile
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
            setSelectedTabIndex={setSelectedTabIndex}
            setBgMaps={setBgMaps}
          />
        )}

        {context.dimensions?.width! > 500 ? (
          <LiveMatchStats
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        ) : (
          <LiveMatchStatsMobile
            matchData={matchData.data.segments[0]}
            selectedTabIndex={selectedTabIndex}
          />
        )}
      </vstack>
    </zstack>
  );
};
