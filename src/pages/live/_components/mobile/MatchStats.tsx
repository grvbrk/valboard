import { Devvit } from '@devvit/public-api';
import { SingleLiveMatchSegment } from 'src/core/types.js';
import { PlayerStatsMobile } from '../../LiveMatchPage.js';
import { StatsHeadingMobile } from './StatsHeading.js';

export function LiveMatchStatsMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];
  const roundsLength = matchData.rounds.length - 1;

  return (
    <hstack width="100%">
      <vstack width={'100%'} padding="small">
        <StatsHeadingMobile roundsLength={roundsLength} playerStat={roundInfo.team1_stats[0]} />

        <vstack alignment="start middle">
          {roundInfo.team1_stats.map((stat) => {
            return <PlayerStatsMobile stat={stat} roundsLength={roundsLength} />;
          })}
        </vstack>

        <spacer width={'5px'} />

        <vstack alignment="start middle">
          {roundInfo.team2_stats.map((stat) => {
            return <PlayerStatsMobile stat={stat} roundsLength={roundsLength} />;
          })}
        </vstack>
      </vstack>
    </hstack>
  );
}
