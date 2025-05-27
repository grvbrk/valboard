import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE } from 'src/core/colors.js';
import { SingleMatchResultSegment } from 'src/core/types.js';
import { totalRoundTime } from 'src/utils/totalRoundTime.js';

export function ResultsMatchInfoMobile({
  matchData,
  selectedTabIndex,
}: {
  matchData: SingleMatchResultSegment;
  selectedTabIndex: number;
}): JSX.Element {
  const { team1, team2, team1_score, team2_score, rounds, logo1, logo2 } = matchData;
  const roundInfo = rounds[selectedTabIndex];
  const totalTime = totalRoundTime(rounds.map((r) => r.map_duration ?? '00:00'));
  const totalTeam1Score = rounds.reduce((sum, r) => sum + parseInt(r.team1_round_score ?? '0'), 0);
  const totalTeam2Score = rounds.reduce((sum, r) => sum + parseInt(r.team2_round_score ?? '0'), 0);

  return (
    <vstack width="100%">
      <spacer size="small" />
      <hstack width={'100%'} height={'100%'}>
        <spacer grow />

        <vstack width={30} grow alignment="center middle">
          <hstack grow alignment="center middle">
            <image
              url={`teams/${logo1.replace('//owcdn.net/img/', '')}`}
              imageHeight={64}
              imageWidth={64}
            />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team1}
          </text>
        </vstack>

        <hstack width={10} grow alignment="center middle">
          <text
            color={
              selectedTabIndex === 0
                ? totalTeam1Score > totalTeam2Score
                  ? 'green'
                  : CLR_DUTCH_WHITE
                : parseInt(roundInfo.team1_round_score!) > parseInt(roundInfo.team2_round_score!)
                  ? 'green'
                  : CLR_DUTCH_WHITE
            }
          >
            {roundInfo.team1_round_score ?? totalTeam1Score}
          </text>
        </hstack>

        <vstack grow alignment="middle center" width={20}>
          <hstack alignment="bottom center">
            <text color={'grey'} size="xsmall">
              {selectedTabIndex === 0 ? totalTime : roundInfo.map_duration!}
            </text>
          </hstack>

          <hstack>
            <text
              weight="bold"
              color={parseInt(team1_score) > parseInt(team2_score) ? 'green' : CLR_DUTCH_WHITE}
              size="xlarge"
            >
              {team1_score}
            </text>
            <spacer size="small" />
            <text weight="bold" color={CLR_DUTCH_WHITE} size="xlarge">
              :
            </text>
            <spacer size="small" />
            <text
              weight="bold"
              color={parseInt(team2_score) > parseInt(team1_score) ? 'green' : CLR_DUTCH_WHITE}
              size="xlarge"
            >
              {team2_score}
            </text>
          </hstack>

          <hstack grow alignment="top center" maxHeight={23} />
        </vstack>

        <hstack width={10} grow alignment="center middle">
          <text
            color={
              selectedTabIndex === 0
                ? totalTeam2Score > totalTeam1Score
                  ? 'green'
                  : CLR_DUTCH_WHITE
                : parseInt(roundInfo.team2_round_score!) > parseInt(roundInfo.team1_round_score!)
                  ? 'green'
                  : CLR_DUTCH_WHITE
            }
          >
            {roundInfo.team2_round_score ?? totalTeam2Score}
          </text>
        </hstack>

        <vstack width={30} grow alignment="center middle">
          <hstack grow alignment="center middle">
            <image
              url={`teams/${logo2.replace('//owcdn.net/img/', '')}`}
              imageHeight={64}
              imageWidth={64}
            />
          </hstack>
          <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
            {team2}
          </text>
        </vstack>

        <spacer grow />
      </hstack>
    </vstack>
  );
}
