import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_WINE, CLR_HIGHLIGHT_RED } from 'src/core/colors.js';
import { SingleLiveMatchSegment } from 'src/core/types.js';

export function LivePageTopBarMobile({
  matchData,
}: {
  matchData: SingleLiveMatchSegment;
}): JSX.Element {
  const { match_event, match_series, event_logo } = matchData;
  return (
    <hstack padding="small" backgroundColor={CLR_DUTCH_WHITE} alignment="start middle">
      <image
        url={`teams/${event_logo.replace('//owcdn.net/img/', '')}`}
        imageHeight={32}
        imageWidth={32}
      />
      <spacer size="small" />
      <vstack grow alignment="start middle" width={60}>
        <text color={CLR_WINE} weight="bold" size="small" wrap>
          {match_series}
        </text>
        <text color={CLR_WINE} size="xsmall">
          {match_event}
        </text>
      </vstack>

      <spacer grow size="medium" />

      <vstack grow alignment="start middle" maxWidth={40}>
        <hstack alignment="center middle">
          <text color={CLR_HIGHLIGHT_RED} size="xsmall">
            LIVE
          </text>
        </hstack>
      </vstack>
    </hstack>
  );
}
