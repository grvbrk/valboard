import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_WINE } from 'src/core/colors.js';
import { SingleUpcomingMatchSegment } from 'src/core/types.js';

export function UpcomingPageTopBar({
  matchData,
}: {
  matchData: SingleUpcomingMatchSegment;
}): JSX.Element {
  const { match_date, match_event, match_series, match_time, event_logo } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <spacer size="small" />

      <image url={event_logo} imageHeight={32} imageWidth={32} />

      <spacer size="small" />

      <vstack alignment="start middle" maxWidth={60}>
        <text color={CLR_WINE} style="heading" size="medium" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} style="body" size="small">
          {match_event}
        </text>
      </vstack>

      <spacer grow />

      <vstack alignment="start middle" maxWidth={40}>
        <text color={CLR_WINE} size="small">
          {match_date}
        </text>
        <text color={CLR_WINE} size="small">
          {match_time}
        </text>
      </vstack>

      <spacer size="small" />
    </hstack>
  );
}
