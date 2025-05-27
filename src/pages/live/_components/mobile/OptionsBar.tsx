import { StateSetter, Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE, CLR_WINE } from 'src/core/colors.js';
import { SingleLiveMatchSegment } from 'src/core/types.js';

export function OptionsBarMobile({
  matchData,
  selectedTabIndex,
  setSelectedTabIndex,
  setBgMaps,
}: {
  matchData: SingleLiveMatchSegment;
  selectedTabIndex: number;
  setSelectedTabIndex: StateSetter<number>;
  setBgMaps: StateSetter<
    {
      name: string;
      show: boolean;
    }[]
  >;
}): JSX.Element {
  return (
    <hstack width={'100%'} alignment="center middle">
      <spacer grow />
      <hstack alignment="start middle">
        {matchData.rounds.map((r, i) => {
          const isActive = selectedTabIndex === i;
          return (
            <>
              <zstack
                cornerRadius="large"
                backgroundColor={isActive ? CLR_DUTCH_WHITE : undefined}
                padding="small"
                onPress={() => {
                  setBgMaps((prev) =>
                    prev.map((map) =>
                      r.map_name === null
                        ? { ...map, show: true }
                        : map.name === r.map_name
                          ? { ...map, show: true }
                          : { ...map, show: false }
                    )
                  );
                  setSelectedTabIndex(i);
                }}
                minWidth={'50px'}
                alignment="center middle"
              >
                <text
                  selectable={false}
                  size="xsmall"
                  color={isActive ? CLR_WINE : CLR_DUTCH_WHITE}
                >
                  {r.map_name ?? 'All'}
                </text>
              </zstack>
            </>
          );
        })}
      </hstack>
      <spacer grow />
    </hstack>
  );
}
