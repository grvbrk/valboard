import {
  Devvit,
  RedisClient,
  RichTextBuilder,
  UIClient,
  useAsync,
  useState,
} from '@devvit/public-api';

import { ErrorState } from 'src/components/Error.js';
import {
  getMatchInfoFromRedis,
  getMatchPageTypeFromRedis,
  getMatchResultFromRedis,
  postMatchResultToRedis,
} from 'src/redis/matches.js';
import { MAPS } from 'src/utils/maps.js';
import { LoadingState } from 'src/components/Loading.js';
import { getCommentExistsFromRedis, postCommentToRedis } from 'src/redis/comments.js';
import { getAllUserPredictionsFromRedis } from 'src/redis/predictions.js';
import {
  calculatePlayerPickRates,
  calculateSuperteamStats,
  calculateWinPredictions,
  getPerfectPredictors,
  getUsernamesFromIds,
} from 'src/core/resultsStats.js';
import { ResultsMatchInfo } from './_components/desktop/MatchInfo.js';
import { ResultsMatchStats } from './_components/desktop/MatchStats.js';
import { OptionsBar } from './_components/desktop/Optionsbar.js';
import { ResultsPageTopBar } from './_components/desktop/Topbar.js';
import { ResultsMatchInfoMobile } from './_components/mobile/MatchInfo.js';
import { ResultsMatchStatsMobile } from './_components/mobile/MatchStats.js';
import { OptionsBarMobile } from './_components/mobile/Optionsbar.js';
import { ResultsPageTopBarMobile } from './_components/mobile/Topbar.js';
import { SingleMatchResultSegment, PageType, SingleMatchResult } from 'src/core/types.js';

export const MatchResultsPage: Devvit.BlockComponent = (_, context) => {
  const { postId, userId, settings, ui, cache, redis } = context;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [bgMaps, setBgMaps] = useState<{ name: string; show: boolean }[]>(
    MAPS.map((map) => {
      return { name: map, show: true };
    })
  );
  const [matchUrl] = useState<string | null>(async () => {
    const matchInfoStr = await getMatchInfoFromRedis(redis, postId!);
    if (!matchInfoStr) return null;
    const { match_page } = JSON.parse(matchInfoStr) as {
      team1: string;
      team2: string;
      match_page: string;
    };
    return match_page;
  });

  async function makeResultComment(
    ui: UIClient,
    redis: RedisClient,
    postId: string,
    data: SingleMatchResultSegment
  ) {
    const matchInfoExists = await getMatchInfoFromRedis(redis, postId);
    if (!matchInfoExists) return;
    const hasCommentBeenPosted = await getCommentExistsFromRedis(redis, postId);
    if (hasCommentBeenPosted > 0) return;
    const pageType = await getMatchPageTypeFromRedis(redis, postId);
    if (!pageType || pageType != PageType.RESULTS) return;

    try {
      const post = await context.reddit.getPostById(postId!);
      const userPreds = await getAllUserPredictionsFromRedis(redis, postId!);
      if (!userPreds || userPreds.length == 0) return;

      const superteam = calculateSuperteamStats(data, userPreds);
      const winPredStats = calculateWinPredictions(userPreds);
      const playerPickRates = calculatePlayerPickRates(data, userPreds);
      const perfectScoreUsers = getPerfectPredictors(data, userPreds);

      let usernames: { userId: string; username: string | undefined }[] = [];
      if (perfectScoreUsers.length < 5) {
        usernames = await getUsernamesFromIds(context, perfectScoreUsers);
      }

      const rtb = new RichTextBuilder();
      rtb.heading({ level: 3 }, (h) => {
        h.rawText('Results & Predictions');
      });

      rtb.horizontalRule();

      rtb.heading({ level: 4 }, (h) => {
        h.rawText('Final Score');
      });
      rtb.paragraph((p) => {
        p.text({
          text: `${data.team1} ${data.team1_score} - ${data.team2} ${data.team2_score}`,
        });
      });

      rtb.horizontalRule();

      rtb.heading({ level: 4 }, (h) => {
        h.rawText(
          `Match Superteam. Picked by ${superteam.pickedByCount} user(s) (${superteam.pickedByPercent})`
        );
      });
      superteam.players.forEach((player, index) => {
        rtb.paragraph((p) => {
          p.text({
            text: `${index + 1}. ${player.teamShort} ${player.name}`,
          });
        });
      });

      rtb.horizontalRule();

      rtb.heading({ level: 4 }, (h) => {
        h.rawText(`Score Predictions`);
      });
      winPredStats.forEach((pred) => {
        rtb.paragraph((p) => {
          p.text({
            text: `Team: ${pred.team}. Score: ${pred.score}. ${pred.pickedByCount} pick(s) (${pred.pickedByPercent})`,
          });
        });
      });

      rtb.horizontalRule();

      rtb.heading({ level: 4 }, (h) => {
        h.rawText(`All players pickrate`);
      });
      playerPickRates.forEach((player, index) => {
        rtb.paragraph((p) => {
          p.text({
            text: `${index + 1}. ${player.teamShort} ${player.name}. ${player.pickedByCount} pick(s) (${player.pickedByPercent}%)`,
          });
        });
      });

      rtb.horizontalRule();

      rtb.heading({ level: 4 }, (h) => {
        h.rawText(`Perfect Predictions`);
      });
      if (usernames.length > 0) {
        usernames.forEach((user, index) => {
          rtb.paragraph((p) => {
            p.text({
              text: `${index + 1}. ${user.username}`,
            });
          });
        });
      } else {
        rtb.paragraph((p) => {
          p.text({
            text: 'No perfect predictions!',
          });
        });
      }

      const comment = await post.addComment({ richtext: rtb });
      // await comment.distinguishAsAdmin();
      await postCommentToRedis(redis, postId!);
    } catch (error) {
      console.error('Errororr', error);
    }
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

      const finalResult = await getMatchResultFromRedis(redis, postId);
      if (finalResult) {
        return JSON.parse(finalResult) as SingleMatchResultSegment;
      }

      const VALBOARD_URL = await settings.get('VALBOARD_URL');
      const url = `${VALBOARD_URL}/match/results/single?url=${match_page}`;

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

            const data = (await response.json()) as SingleMatchResult;
            if (data.data.status != 200) {
              throw Error(`Error! Status code: ${data.data.status}`);
            }

            await postMatchResultToRedis(redis, postId, data.data.segments[0]);
            return data.data.segments[0] as SingleMatchResultSegment;
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
          key: `result-${postId}`,
          ttl: 300000, // 5 min
        }
      );
    },
    {
      finally: (data, error) => {
        if (error) {
          console.error('Failed to load data:', error);
        }
        if (data != null) {
          const newBgMaps = data.rounds
            .filter((r) => r.map_name)
            .map((map) => {
              return { name: map.map_name, show: true };
            }) as { name: string; show: boolean }[];
          setBgMaps(newBgMaps);
          makeResultComment(context.ui, context.redis, postId!, data);
        }
      },
    }
  );

  if (error) return <ErrorState />;
  if (!matchData || loading) return <LoadingState />;

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
        {context.dimensions?.width! > 400 ? (
          <ResultsPageTopBar matchData={matchData} url={matchUrl} ui={ui} />
        ) : (
          <ResultsPageTopBarMobile matchData={matchData} url={matchUrl} ui={ui} />
        )}

        {context.dimensions?.width! > 400 ? (
          <ResultsMatchInfo matchData={matchData} selectedTabIndex={selectedTabIndex} />
        ) : (
          <ResultsMatchInfoMobile matchData={matchData} selectedTabIndex={selectedTabIndex} />
        )}

        <spacer size="small" />

        <vstack width="100%" alignment="center middle">
          <text alignment="center middle" color={'grey'} size={`xsmall`} width={90} wrap>
            {matchData.team_picks}
          </text>
        </vstack>

        <spacer size="small" />

        {context.dimensions?.width! > 400 ? (
          <OptionsBar
            matchData={matchData}
            selectedTabIndex={selectedTabIndex}
            setSelectedTabIndex={setSelectedTabIndex}
            setBgMaps={setBgMaps}
          />
        ) : (
          <OptionsBarMobile
            matchData={matchData}
            selectedTabIndex={selectedTabIndex}
            setSelectedTabIndex={setSelectedTabIndex}
            setBgMaps={setBgMaps}
          />
        )}

        {context.dimensions?.width! > 500 ? (
          <ResultsMatchStats matchData={matchData} selectedTabIndex={selectedTabIndex} />
        ) : (
          <ResultsMatchStatsMobile matchData={matchData} selectedTabIndex={selectedTabIndex} />
        )}
      </vstack>
    </zstack>
  );
};
