import unittest

from bs4 import BeautifulSoup

from src.scrapers.players import (
    parse_player_stat,
    parse_player_stats,
    parse_roster,
    split_team_rows,
    team_tag,
)

SCOREBOARD = """
<div class="vm-stats-game" data-game-id="all">
  <div class="ovw-table">
    <div class="ovw-row mod-head"><div class="ovw-th">R</div></div>
    <div class="ovw-row">
      <div class="ovw-cell mod-player">
        <div class="ovw-player">
          <i class="flag mod-cn" title="China"></i>
          <a href="/player/3028/life">
            <div class="ovw-player-name text-of">Life</div>
            <div class="ovw-player-tag ge-text-light">DRG</div>
          </a>
        </div>
        <div class="ovw-agents"><img title="Neon"/><img title="Jett"/></div>
      </div>
      <div class="ovw-cell" data-col="rating2"><span class="mod-both">1.43</span></div>
      <div class="ovw-cell" data-col="acs"><span class="mod-both">243</span></div>
      <div class="ovw-cell mod-kda">
        <span class="ovw-kda-stat" data-col="kills"><span class="mod-both">33</span></span>
        <span class="ovw-kda-stat" data-col="deaths"><span class="mod-both">19</span></span>
        <span class="ovw-kda-stat" data-col="assists"><span class="mod-both">6</span></span>
      </div>
      <div class="ovw-cell" data-col="kd-diff"><span class="mod-both">+14</span></div>
      <div class="ovw-cell" data-col="kast"><span class="mod-both">76%</span></div>
      <div class="ovw-cell" data-col="adr"><span class="mod-both">152</span></div>
      <div class="ovw-cell" data-col="hsp"><span class="mod-both">26%</span></div>
      <div class="ovw-cell" data-col="fb"><span class="mod-both">6</span></div>
      <div class="ovw-cell" data-col="fd"><span class="mod-both">3</span></div>
      <div class="ovw-cell" data-col="fk-diff"><span class="mod-both">+3</span></div>
    </div>
  </div>
  <div class="ovw-table">
    <div class="ovw-row mod-head"><div class="ovw-th">R</div></div>
    <div class="ovw-row">
      <div class="ovw-cell mod-player">
        <div class="ovw-player">
          <i class="flag mod-kr"></i>
          <a href="/player/1/foo">
            <div class="ovw-player-name text-of">Foo</div>
            <div class="ovw-player-tag ge-text-light">AQ</div>
          </a>
        </div>
        <div class="ovw-agents"></div>
      </div>
      <div class="ovw-cell" data-col="acs"><span class="mod-both">180</span></div>
    </div>
  </div>
</div>
"""


def soup(markup):
    return BeautifulSoup(markup, "html.parser")


class SplitTeamRowsTest(unittest.TestCase):
    def test_splits_two_teams_and_drops_the_header_row(self):
        rows1, rows2 = split_team_rows(soup(SCOREBOARD))
        self.assertEqual(len(rows1), 1)
        self.assertEqual(len(rows2), 1)

    def test_returns_empty_when_the_grid_is_absent(self):
        # An upcoming match with unpublished rosters must not raise.
        self.assertEqual(split_team_rows(soup("<div></div>")), ([], []))


class RosterTest(unittest.TestCase):
    def test_parses_name_and_flag(self):
        rows1, _ = split_team_rows(soup(SCOREBOARD))
        self.assertEqual(
            parse_roster(rows1), [{"id": 1, "name": "Life", "flag": "flag-cn"}]
        )

    def test_team_tag_reads_the_abbreviation(self):
        rows1, rows2 = split_team_rows(soup(SCOREBOARD))
        self.assertEqual(team_tag(rows1), "DRG")
        self.assertEqual(team_tag(rows2), "AQ")

    def test_team_tag_is_blank_without_rows(self):
        self.assertEqual(team_tag([]), "")


class PlayerStatTest(unittest.TestCase):
    def test_reads_every_column_by_data_col(self):
        rows1, _ = split_team_rows(soup(SCOREBOARD))
        stat = parse_player_stat(rows1[0])
        self.assertEqual(stat["name"], "Life")
        self.assertEqual(stat["flag"], "flag-cn")
        self.assertEqual(stat["agents"], ["Neon", "Jett"])
        self.assertEqual(stat["rating"], "1.43")
        self.assertEqual(stat["acs"], "243")
        self.assertEqual((stat["k"], stat["d"], stat["a"]), ("33", "19", "6"))
        self.assertEqual(stat["diff_k_d"], "+14")
        self.assertEqual(stat["kast"], "76%")
        self.assertEqual(stat["adr"], "152")
        self.assertEqual(stat["hs"], "26%")
        self.assertEqual((stat["fk"], stat["fd"], stat["diff_fk_fd"]), ("6", "3", "+3"))

    def test_missing_columns_become_empty_strings_not_missing_keys(self):
        # Lower-tier events publish only some columns; the consumer's PlayerStat
        # type still expects every key to be present.
        _, rows2 = split_team_rows(soup(SCOREBOARD))
        stat = parse_player_stat(rows2[0])
        self.assertEqual(stat["acs"], "180")
        for field in ("rating", "kast", "adr", "hs", "fk", "fd", "diff_fk_fd"):
            self.assertEqual(stat[field], "", f"{field} should be blank, not missing")

    def test_skips_rows_without_a_player_name(self):
        rows = soup('<div class="ovw-row"><div class="ovw-cell"></div></div>').select(
            "div.ovw-row"
        )
        self.assertEqual(parse_player_stats(rows), [])


if __name__ == "__main__":
    unittest.main()
