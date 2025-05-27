import { Devvit } from '@devvit/public-api';
import {
  CLR_DUTCH_WHITE,
  CLR_WINE,
  CLR_DARK_1,
  CLR_HIGHLIGHT_RED,
  CLR_HIGHLIGHT_GREEN,
} from 'src/core/colors.js';
import { PlayerStat } from 'src/core/types.js';

export function PlayerStats({
  stat,
  roundsLength,
}: {
  stat: PlayerStat;
  roundsLength: number;
}): JSX.Element {
  return (
    <hstack grow width={'100%'} height={'100%'} alignment="start middle">
      <spacer size="small" />

      <hstack alignment="start middle" padding="xsmall" height={'100%'} width={30} grow>
        <image
          url={`flags/${stat.flag.replace('flag-', '')}.png`}
          imageHeight={14}
          imageWidth={14}
          height={100}
          resizeMode="fit"
        />
        <spacer width={'3px'} />
        <text alignment="start middle" color={CLR_DUTCH_WHITE} size="small">
          {stat.name}
        </text>
      </hstack>

      <spacer size="small" />

      {stat.agents.length > 0 && (
        <hstack alignment="start middle" width={roundsLength * 9} grow>
          {stat.agents.map((agent) => {
            return (
              <image url={`agents/${agent.toLowerCase()}.png`} imageHeight={20} imageWidth={20} />
            );
          })}
        </hstack>
      )}

      <spacer size="small" />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={16}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.acs}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={33}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.k} / {stat.d} / {stat.a}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={16}
        height={'100%'}
        grow
      >
        <text
          color={
            stat.diff_k_d.startsWith('-')
              ? CLR_HIGHLIGHT_RED
              : stat.diff_k_d.startsWith('+')
                ? CLR_HIGHLIGHT_GREEN
                : CLR_WINE
          }
          size="xsmall"
        >
          {stat.diff_k_d}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.hs}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.adr}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.kast}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.fk}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DARK_1}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text color={CLR_WINE} size="xsmall">
          {stat.fd}
        </text>
      </hstack>

      <spacer width={'1px'} />

      <hstack
        backgroundColor={CLR_DUTCH_WHITE}
        alignment="center middle"
        padding="xsmall"
        width={17}
        height={'100%'}
        grow
      >
        <text
          color={
            stat.diff_fk_fd.startsWith('-')
              ? CLR_HIGHLIGHT_RED
              : stat.diff_fk_fd.startsWith('+')
                ? CLR_HIGHLIGHT_GREEN
                : CLR_WINE
          }
          size="xsmall"
        >
          {stat.diff_fk_fd}
        </text>
      </hstack>

      <spacer size="small" />
    </hstack>
  );
}
