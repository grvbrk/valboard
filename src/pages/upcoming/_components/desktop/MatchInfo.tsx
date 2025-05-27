import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_HIGHLIGHT_GREEN_DARK } from 'src/core/colors.js';
import { SingleUpcomingMatchSegment, PredictionType } from 'src/core/types.js';

export function UpcomingMatchInfo({
  matchData,
  timeLeft,
  userPreds,
}: {
  matchData: SingleUpcomingMatchSegment;
  timeLeft: string;
  userPreds: PredictionType | null;
}): JSX.Element {
  const { team1, team2, rounds, logo1, logo2 } = matchData;
  return (
    <zstack width="100%">
      <hstack width={'100%'} height={'100%'} padding="medium">
        <spacer size="medium" />
        <hstack grow alignment="middle start" width={40}>
          <text
            width={50}
            alignment="center middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            wrap
          >
            {team1}
          </text>
          <hstack width={50} grow alignment="center middle">
            <image url={logo1} imageHeight={48} imageWidth={48} />
          </hstack>
        </hstack>

        <vstack grow alignment="center middle" width={20}>
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {timeLeft}
          </text>
          <spacer size="small" />
          {userPreds && (
            <vstack alignment="center middle">
              <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                Your Prediction
              </text>
              <hstack alignment="center middle">
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                  {userPreds.team1ScorePred}
                </text>
                <spacer size="small" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                  :
                </text>
                <spacer size="small" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="small">
                  {userPreds.team2ScorePred}
                </text>
              </hstack>
              <spacer size="small" />
            </vstack>
          )}
          <text color={CLR_DUTCH_WHITE} style="body" size="small">
            {rounds}
          </text>
        </vstack>

        <hstack grow alignment="middle end" width={40}>
          <hstack width={50} grow alignment="center middle">
            <image url={logo2} imageHeight={48} imageWidth={48} />
          </hstack>
          <text
            alignment="center middle"
            color={CLR_DUTCH_WHITE}
            size="large"
            weight="bold"
            wrap
            width={50}
          >
            {team2}
          </text>
        </hstack>
        <spacer size="medium" />
      </hstack>
    </zstack>
  );
}
