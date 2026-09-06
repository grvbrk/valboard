HEADER_CLASS = "mod-head"

def team_tables(container):
    """The two `div.ovw-table` elements (team 1, team 2) inside a container."""
    return container.select("div.ovw-table")


def player_rows(table):
    """Player rows within one team's table, excluding the header row."""
    return [
        row
        for row in table.select("div.ovw-row")
        if HEADER_CLASS not in (row.get("class") or [])
    ]


def split_team_rows(container):
    """Returns (team1_rows, team2_rows); empty lists when the grid is absent."""
    tables = team_tables(container)
    if len(tables) < 2:
        return [], []
    return player_rows(tables[0]), player_rows(tables[1])


def stats_container(soup, index=0):
    """One `div.vm-stats-game` block, or None when the page has no scoreboard."""
    games = soup.select("div.vm-stats-game")
    return games[index] if len(games) > index else None


def team_tag(rows):
    """Team abbreviation, read off the first player row. '' when unavailable."""
    for row in rows:
        tag = row.select_one(".ge-text-light")
        if tag:
            return tag.getText().strip()
    return ""


def player_name(row):
    name = row.select_one(".text-of")
    return name.getText().strip() if name else ""


def player_flag(row):
    """Flag class rendered the way the app expects, e.g. 'flag-cn'."""
    icon = row.select_one("i")
    if not icon:
        return ""
    return "".join(icon.get("class") or []).replace("mod", "")


def parse_roster(rows):
    """Rows -> the `players1`/`players2` shape the API returns."""
    roster = []
    for idx, row in enumerate(rows):
        name = player_name(row)
        if not name:
            continue
        roster.append({"id": idx + 1, "name": name, "flag": player_flag(row)})
    return roster


DATA_COL_TO_FIELD = {
    "rating2": "rating",
    "acs": "acs",
    "kills": "k",
    "deaths": "d",
    "assists": "a",
    "kd-diff": "diff_k_d",
    "kast": "kast",
    "adr": "adr",
    "hsp": "hs",
    "fb": "fk",
    "fd": "fd",
    "fk-diff": "diff_fk_fd",
}

# Every key the consumer's PlayerStat type expects, so a partially-populated
# scoreboard yields empty strings rather than missing keys.
STAT_FIELDS = (
    "rating",
    "acs",
    "k",
    "d",
    "a",
    "diff_k_d",
    "kast",
    "adr",
    "hs",
    "fk",
    "fd",
    "diff_fk_fd",
)


def player_agents(row):
    """Agent names played, from the agent icons' title attributes."""
    return [
        img.get("title").strip()
        for img in row.select(".ovw-agents img")
        if img.get("title")
    ]


def parse_player_stat(row):
    """One player row -> the stat dict the API returns."""
    stat = {field: "" for field in STAT_FIELDS}
    stat["name"] = player_name(row)
    stat["flag"] = player_flag(row)
    stat["agents"] = player_agents(row)

    for cell in row.select("[data-col]"):
        field = DATA_COL_TO_FIELD.get(cell.get("data-col"))
        if not field:
            continue
        value = cell.select_one("span.mod-both")
        if value is not None:
            stat[field] = value.getText().strip()

    return stat


def parse_player_stats(rows):
    """Rows -> the `teamN_stats` list, skipping any row without a player name."""
    return [parse_player_stat(row) for row in rows if player_name(row)]
