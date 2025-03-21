import requests
from bs4 import BeautifulSoup


def scrape_all_live_matches():
    url = "https://www.vlr.gg"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")

    matches = soup.select(".js-home-matches-upcoming a.wf-module-item")
    for match in matches:
        is_live = match.select_one(".h-match-eta.mod-live")
        if is_live:
            teams = []
            for team in match.select(".h-match-team"):
                teams_el = team.select_one(".h-match-team-name")
                teams.append(teams_el.getText().strip())

            url_path = "https://www.vlr.gg/" + match.get("href")

            results.append(
                {
                    "team1": teams[0],
                    "team2": teams[1],
                    "match_page": url_path,
                }
            )
    return {"data": {"status": response.status_code, "segments": results}}
