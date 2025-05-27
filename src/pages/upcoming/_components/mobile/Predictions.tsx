import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_HIGHLIGHT_GREEN, CLR_WINE } from 'src/core/colors.js';
import { PredictionType } from 'src/core/types.js';

export function PredictionsMobile({
  mount,
  userPreds,
}: {
  mount: () => void;
  userPreds: PredictionType | null;
}): JSX.Element {
  return (
    <vstack grow alignment="center middle">
      <hstack
        cornerRadius="large"
        backgroundColor={CLR_DUTCH_WHITE}
        padding="small"
        alignment="center middle"
        gap="small"
        onPress={mount}
        width={50}
      >
        <text
          selectable={false}
          size="small"
          color={userPreds ? CLR_HIGHLIGHT_GREEN : CLR_WINE}
          weight="bold"
        >
          SUPERTEAM
        </text>
        {userPreds ? (
          <icon size="small" color={CLR_HIGHLIGHT_GREEN} name="checkmark-fill"></icon>
        ) : (
          <icon size="small" color={CLR_WINE} name="send-fill"></icon>
        )}
      </hstack>
    </vstack>
  );
}
