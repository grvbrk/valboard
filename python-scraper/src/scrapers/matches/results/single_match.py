from src.scrapers.http import fetch_page
from src.scrapers.players import (
    parse_player_stats,
    split_team_rows,
    stats_container,
    team_tag,
)
from bs4 import BeautifulSoup


async def scrape_single_match_result(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []

    response = await fetch_page(url, headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")

    match_info = soup.select_one("div.match-header")

    match_series = (
        match_info.select_one("a.match-header-event > div > div:nth-of-type(1)")
        .getText()
        .strip()
    )

    match_event = (
        match_info.select_one("a.match-header-event div.match-header-event-series")
        .getText()
        .strip()
        .replace("\n", "")
        .replace("\t", "")
    )

    match_series_logo = match_info.select_one("a.match-header-event img").get("src")

    teams = match_info.select(
        ".match-header-link .match-header-link-name .wf-title-med"
    )
    team1_name = teams[0].getText().strip().replace("\n", "").replace("\t", "")
    team2_name = teams[1].getText().strip().replace("\n", "").replace("\t", "")

    team_logos = match_info.select(".match-header-link img")
    team1_logo = team_logos[0].get("src")
    team2_logo = team_logos[1].get("src")

    scores = match_info.select("div.match-header-vs-score .sp-hide span")
    team1_score = scores[0].getText().strip()
    team2_score = scores[2].getText().strip()

    team_picks_el = match_info.select_one(".match-header-note")
    team_picks = team_picks_el.getText().strip() if team_picks_el else ""

    # _________________________________________ #

    container = stats_container(soup)
    team1_players, team2_players = split_team_rows(container) if container else ([], [])

    team1_short = team_tag(team1_players) or team1[:3].upper()
    team2_short = team_tag(team2_players) or team2[:3].upper()

    rounds_arr = []

    rounds = soup.select("div.vm-stats-game")
    for idx, round in enumerate(rounds):
        match idx:
            case 0:
                """Round 1"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()
                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                team1_players, team2_players = split_team_rows(round)

                team1_player_stats = parse_player_stats(team1_players)
                team2_player_stats = parse_player_stats(team2_players)

                rounds_arr.append(
                    {
                        "round": "1",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    }
                )

            case 1:
                """All"""
                team1_players, team2_players = split_team_rows(round)

                team1_player_stats = parse_player_stats(team1_players)
                team2_player_stats = parse_player_stats(team2_players)

                rounds_arr.insert(
                    0,
                    {
                        "round": "all",
                        "map_name": None,
                        "map_duration": None,
                        "team1_round_score": None,
                        "team2_round_score": None,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    },
                )

            case 2:
                """Round 2"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()
                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                team1_players, team2_players = split_team_rows(round)

                team1_player_stats = parse_player_stats(team1_players)
                team2_player_stats = parse_player_stats(team2_players)

                rounds_arr.append(
                    {
                        "round": "2",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    }
                )

            case 3:
                """Round 3"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()
                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                team1_players, team2_players = split_team_rows(round)

                team1_player_stats = parse_player_stats(team1_players)
                team2_player_stats = parse_player_stats(team2_players)

                rounds_arr.append(
                    {
                        "round": "3",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    }
                )

            case 4:
                """Round 4"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()
                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                team1_players, team2_players = split_team_rows(round)

                team1_player_stats = parse_player_stats(team1_players)
                team2_player_stats = parse_player_stats(team2_players)

                rounds_arr.append(
                    {
                        "round": "4",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    }
                )

            case 5:
                """Round 5"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()
                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                team1_players, team2_players = split_team_rows(round)

                team1_player_stats = parse_player_stats(team1_players)
                team2_player_stats = parse_player_stats(team2_players)

                rounds_arr.append(
                    {
                        "round": "5",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    }
                )

    results.append(
        {
            "team1": team1_name,
            "team2": team2_name,
            "logo1": team1_logo,
            "logo2": team2_logo,
            "team1_short": team1_short,
            "team2_short": team2_short,
            "match_series": match_series,
            "match_event": match_event,
            "event_logo": match_series_logo,
            "team1_score": team1_score,
            "team2_score": team2_score,
            "team_picks": team_picks,
            "rounds": rounds_arr,
        }
    )
    return {"data": {"status": response.status_code, "segments": results}}
