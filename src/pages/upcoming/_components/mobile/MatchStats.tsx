import { Devvit } from '@devvit/public-api';
import { SingleUpcomingMatchSegment, PredictionType } from 'src/core/types.js';
import { Player1Mobile, Player2Mobile } from '../../UpcomingMatchPage.js';

export function UpcomingMatchStatsMobile({
  matchData,
  userPreds,
  playerPickRates,
}: {
  matchData: SingleUpcomingMatchSegment;
  userPreds: PredictionType | null;
  playerPickRates:
    | {
        name: string;
        pickRate: string;
      }[]
    | null;
}): JSX.Element {
  const { players1, players2, team1_short, team2_short } = matchData;
  return (
    <hstack width={'100%'} alignment="middle center" padding="medium" gap="large">
      <hstack grow alignment="start middle" width={50}>
        <spacer grow />
        <vstack alignment="start middle">
          {players1.map((player) => {
            return (
              <Player1Mobile
                player={player}
                team1_short={team1_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
        <spacer grow />
      </hstack>

      <hstack grow alignment="start middle" width={50}>
        <spacer grow />
        <vstack alignment="start middle">
          {players2.map((player) => {
            return (
              <Player2Mobile
                player={player}
                team2_short={team2_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
        <spacer grow />
      </hstack>
    </hstack>
  );
}
