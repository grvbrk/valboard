import { Devvit } from '@devvit/public-api';
import { SingleUpcomingMatchSegment, PredictionType } from 'src/core/types.js';
import { Player1, Predictions, Player2 } from '../../UpcomingMatchPage.js';

export function UpcomingMatchStats({
  matchData,
  mount,
  userPreds,
  playerPickRates,
}: {
  matchData: SingleUpcomingMatchSegment;
  mount: () => void;
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
    <hstack width={'100%'} alignment="middle center" padding="medium">
      <hstack grow alignment="start middle" width={50}>
        <spacer grow />
        <vstack alignment="start middle">
          {players1.map((player) => {
            return (
              <Player1
                player={player}
                team1_short={team1_short}
                userPreds={userPreds}
                playerPickRates={playerPickRates}
              />
            );
          })}
        </vstack>
      </hstack>

      <spacer size="large" />

      <Predictions mount={mount} userPreds={userPreds} />

      <spacer size="large" />

      <hstack grow alignment="start middle" width={50}>
        <vstack alignment="start middle">
          {players2.map((player) => {
            return (
              <Player2
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
