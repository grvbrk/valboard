import { Devvit } from '@devvit/public-api';
import { SingleMatchResultSegment } from 'src/core/types.js';
import { StatsHeadingMobile } from '../../MatchResultsPage.js';
import { PlayerStatsMobile } from './PlayerStats.js';

export function ResultsMatchStatsMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const roundInfo = matchData.rounds[selectedTabIndex];
  const roundsLength = matchData.rounds.length - 1;

  return (
    <hstack width="100%">
      <vstack width={'100%'} padding="small">
        <StatsHeadingMobile roundsLength={roundsLength} />

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
