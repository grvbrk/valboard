import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_HIGHLIGHT_GREEN_DARK } from 'src/core/colors.js';
import { SingleUpcomingMatchSegment, PredictionType } from 'src/core/types.js';

export function UpcomingMatchInfoMobile({
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
        <spacer grow />
        <hstack grow alignment="middle start" width={35}>
          <vstack grow alignment="center middle">
            <image url={logo1} imageHeight={64} imageWidth={64} />
            <spacer size="small" />
            <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
              {team1}
            </text>
          </vstack>
        </hstack>

        <vstack grow alignment="center middle" width={30}>
          <text color={CLR_DUTCH_WHITE} alignment="center middle" size="xsmall">
            {timeLeft}
          </text>
          <spacer size="xsmall" />
          {userPreds && (
            <vstack alignment="center middle">
              <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                Your Prediction
              </text>
              <hstack alignment="center middle">
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                  {userPreds.team1ScorePred}
                </text>
                <spacer size="xsmall" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                  :
                </text>
                <spacer size="xsmall" />
                <text weight="bold" color={CLR_HIGHLIGHT_GREEN_DARK} size="xsmall">
                  {userPreds.team2ScorePred}
                </text>
              </hstack>
              <spacer size="xsmall" />
            </vstack>
          )}
          <text color={CLR_DUTCH_WHITE} alignment="center middle" size="xsmall">
            {rounds}
          </text>
        </vstack>

        <hstack grow alignment="middle end" width={35}>
          <vstack grow alignment="center middle">
            <image url={logo2} imageHeight={64} imageWidth={64} />
            <spacer size="small" />
            <text alignment="center middle" color={CLR_DUTCH_WHITE} size="small" weight="bold" wrap>
              {team2}
            </text>
          </vstack>
        </hstack>
        <spacer grow />
      </hstack>
    </zstack>
  );
}
