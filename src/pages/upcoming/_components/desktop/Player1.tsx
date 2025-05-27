import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_HIGHLIGHT_GREEN_DARK } from 'src/core/colors.js';
import { PredictionType } from 'src/core/types.js';

export function Player1({
  player,
  team1_short,
  userPreds,
  playerPickRates,
}: {
  player: {
    name: string;
    flag: string;
  };
  team1_short: string;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const isInSuperTeam = userPreds?.superTeam.some((p) => p.name === player.name) || false;

  return (
    <hstack grow alignment="start middle">
      <image
        url={`flags/${player.flag.replace('flag-', '')}.png`}
        imageHeight={16}
        imageWidth={16}
      />
      <vstack grow padding="small">
        <hstack alignment="start middle">
          <text color={CLR_DUTCH_WHITE} size="medium" overflow="ellipsis">
            {player.name}
          </text>
          <spacer size="xsmall" />
          {playerPickRates && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              {playerPickRates.find((p) => p.name === player.name)?.pickRate || '0%'}
            </text>
          )}
        </hstack>
        <hstack>
          <text color={'grey'} size="xsmall">
            {team1_short}
          </text>
          <spacer size="xsmall" />
          {isInSuperTeam && (
            <text color={CLR_HIGHLIGHT_GREEN_DARK} weight="bold" size="xsmall">
              • SUPERTEAM
            </text>
          )}
        </hstack>
      </vstack>
      <spacer grow />
    </hstack>
  );
}
