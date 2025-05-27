import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE } from 'src/core/colors.js';
import { PlayerStat } from 'src/core/types.js';

export function StatsHeadingMobile({
  roundsLength,
  playerStat,
}: {
  roundsLength: number;
  playerStat: PlayerStat;
}): JSX.Element {
  return (
    <hstack grow width={'100%'} alignment="end middle">
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={30} />

      <spacer size="small" />
      {playerStat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 9} grow />
      )}
      <spacer size="small" />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ACS
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={33}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          K / D / A
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={16}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          +/-
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          HS%
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack grow padding="xsmall" alignment="center middle" width={17}>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          ADR
        </text>
      </hstack>

      <spacer size="small" />
    </hstack>
  );
}
