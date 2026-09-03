function displayStandings(league, season) {
    document.getElementById("standings-button").classList.add("active");

    let html = `
        <h2>Standings</h2>
        <table>
            <thead>
                <tr>
                    <th class="right-align">Rank</th>
                    <th class="left-align">Team</th>
                    <th class="right-align">W</th>
                    <th class="right-align">L</th>
                    <th class="right-align">T</th>
                    <th class="right-align">PTS</th>
                    <th class="right-align">WTL%</th>
                    <th class="right-align">NG</th>
                    <th class="right-align">NS</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const team of league.teams) {
        const rankString = team.rankTie? `T-${team.rank}`: `${team.rank}`;

        html += `
            <tr class="standings-table-row" style="--team-color: ${team.color};">
                <td class="right-align">${rankString}</td>
                <td class="left-align">
                    <a href="?season=${season}&page=team&id=${team.id}">
                        ${team.name}
                    </a>
                </td>
                <td class="right-align">${team.wins}</td>
                <td class="right-align">${team.losses}</td>
                <td class="right-align">${team.ties}</td>
                <td class="right-align">${team.rankingPoints}</td>
                <td class="right-align">${team.wtlPerc.toFixed(3).replace(/^0/, "")}</td>
                <td class="right-align">${team.netGames}</td>
                <td class="right-align">${team.netScore}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
        <span class="glossary">
            <h4>Glossary</h4>
            <p>
                <span class="glossary-abbr">PTS:</span> Ranking Points (2 points awarded for each match win and 1 point for each match tie) <br>
                <span class="glossary-abbr">WTL%:</span> Win-Tie-Loss Percent (percentage of matches won, with each tie counting as 1/2 of a win) <br>
                <span class="glossary-abbr">NG:</span> Net Games Won/Lost (number of games won minus number of games lost) <br>
                <span class="glossary-abbr">NS:</span> Net Score For/Against (sum of the team's scores in all games minus sum of opponents' scores in all games)
            </p>
        </span>
    `;

    return html;
}

function displaySchedule(league, season, week) {
    document.getElementById("schedule-button").classList.add("active");

    if (week === 0) {
        const todayDate = new Date();

        let closestMatchDateIndex = -1;
        let closestDifference = -1.0;

        for (let i = 0; i < league.matchDates.length; i++) {
            const matchDate = new Date(league.matchDates[i].date);

            const matchDateDiff = Math.abs(matchDate - todayDate);

            if (i === 0 || matchDateDiff <= closestDifference) {
                closestMatchDateIndex = i;
                closestDifference = matchDateDiff;
            }
        }

        week = closestMatchDateIndex + 1;
    }

    let html = `
        <h2>Schedule</h2>
        <select id="week-select">
    `;

    for (let i = 0; i < league.matchDates.length; i++) {
        html += `<option value="?season=${season}&page=schedule&week=${i + 1}"`;

        if (week === i + 1) html += ` selected`;

        html += `>Week ${i + 1}</option>`;
    }

    const dateTimeString = formatDateTime(new Date(league.matchDates[week - 1].date));
    const locationString = league.matchDates[week - 1].location;

    html += `
        </select>
        <h4>${dateTimeString}</h4>
        <h4>${locationString}</h4>
        <table>
            <thead>
                <tr>
                    <th class="left-align">Matchup</th>
                    <th class="left-align">Result</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const match of league.matches) {
        const team1 = league.getTeam(match.team1ID);
        const team2 = league.getTeam(match.team2ID);

        if (match.week === week) {
            html += `
                <tr>
                    <td class="left-align"><a href="?season=${season}&page=match&id=${match.id}">
                        ${team1.name} vs. ${team2.name}
                    </a></td>
                    <td class="left-align match-result">
            `;

            if (match.isComplete()) {
                html += `<span class="result-team-1 match-`;

                if (match.winnerID === team1.id) html += `winner`;
                else if (match.winnerID === team2.id) html += `loser`;
                else html += `tier`;

                html += `" style="--team-color: ${team1.color};"><span class="acronym">${team1.acronym}</span><span class="game-wins">${match.team1GameWins}</span></span><span class="result-separator">-</span><span class="result-team-2 match-`;

                if (match.winnerID === team2.id) html += `winner`;
                else if (match.winnerID === team1.id) html += `loser`;
                else html += `tier`;

                html += `" style="--team-color: ${team2.color};"><span class="game-wins">${match.team2GameWins}</span><span class="acronym">${team2.acronym}</span></span>`;
            }
            else html += `<span class="match-incomplete">TBD</span>`;

            html += `
                    </td>
                </tr>
            `;
        }
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

function displayPlayoffs(league, season) {
    document.getElementById("playoffs-button").classList.add("active");
    
    return `
        <h2>Playoffs</h2>
        <p>This page is still in development... stay tuned!</p>
    `;
}

function displayTiebreaker() {
    document.getElementById("tiebreaker-button").classList.add("active");

    return `
        <h2>Tiebreaking Procedures</h2>
        <p>This page outlines the way the website determines rankings and breaks ties for the league.</p>
        <p>Team rankings are determined in order of highest to lowest number of ranking points (2 points are earned for each match win and 1 point is earned for each match tie).</p>
        <h4>To Break a Tie Between Two Teams:</h4>
        <ol>
            <li>Better Record (Win-Tie-Loss%) on Head-to-Head Matches</li>
            <li>More Individual Games Won on Head-to-Head Matches</li>
            <li>Higher Totaled Score on Head-to-Head Matches</li>
            <li>Better Overall Win-Tie-Loss%</li>
            <li>Better Overall Net Games Won / Lost</li>
            <li>Better Overall Net Score For / Against</li>
        </ol>
        <ul><li>If it gets to this point, the teams are officially tied in ranking, and will have to flip a coin to determine how to proceed.</li></ul>
        <h4>To Break a Tie Between Three or More Teams<span class="tiebreaker-footnote">*</span>:</h4>
        <ol>
            <li>Best Win-Tie-Loss% in Matches Among the Tied Teams</li>
            <li>Best Net Games Won / Lost in Matches Among the Tied Teams</li>
            <li>Best Net Score For / Against in Matches Among the Tied Teams</li>
            <li>Best Overall Win-Tie-Loss%</li>
            <li>Best Overall Net Games Won / Lost</li>
            <li>Best Overall Net Score For / Against</li>
        </ol>
        <ul><li>If it gets to this point, the teams are officially tied in ranking, and will have to roll dice to determine how to proceed.</li></ul>
        <p class="tiebreaker-footnote">*If after one of these steps the tie is broken but a smaller tie between two or more teams remains, seed the teams that have broken out of the tie appropriately and start at the beginning of the tie procedures for the remaining teams.</p>
    `;
}

function displayTeam(league, season, teamID) {
    const team = league.getTeam(teamID);

    const rankString = team.rankTie? `T-${team.rank}`: `${team.rank}`;
    
    return `
        <h2>Team Info</h2>
        <p>${team.name}: ${team.rankingPoints} pts (${rankString})</p>
        <div class="team-card" style="--team-color: ${team.color}">
            <p>This page is still in development... stay tuned!</p>
        </div>
    `;
}

function displayMatch(league, season, matchID) {
    const match = league.getMatch(matchID);
    const team1 = league.getTeam(match.team1ID);
    const team2 = league.getTeam(match.team2ID);

    let html = `
        <h2>Match Info</h2>
    `;
    
    if (match.week === "Playoffs") {
        const playoffMatchStructure = league.getPlayoffMatchStructure(matchID);

        html += `
            <p>Playoff Match ${matchID}</p>
        `;
    }
    else {
        html += `
            <p>${team1.name} vs. ${team2.name} - Week ${match.week}</p>
        `;
    }

    html += `
        <p>This page is still in development... stay tuned!</p>
    `;
    
    return html;
}

function pageNotFound() {
    document.getElementById("season-selector").remove();
    document.getElementById("nav-buttons").remove();

    document.getElementById("content").innerHTML = `
        <h2>Page Not Found</h2>
        <p>The page you requested could not be found.</p>
        <a href="/"><button>Return Home</button></a>
    `
}

function strictParseInt(string) {
    if (string === null) return null;
    else if (!(/^[+-]?\d+$/.test(string))) return NaN;
    else return Number(string);
}

function formatDateTime(date) {
    const dateString = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    const day = date.getDate();

    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";

    const dateWithSuffix = dateString.replace(
        `${day},`,
        `${day}${suffix},`
    );

    const timeString = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    }).toLowerCase();

    return `${dateWithSuffix} at ${timeString}`;
}

async function main() {
    const collectiveInfoResponse = await fetch("Collective Info.json");
    const collectiveInfoData = await collectiveInfoResponse.json();
    const leagueName = collectiveInfoData.leagueName;
    const seasonNames = collectiveInfoData.seasonNames;

    document.getElementById("title").textContent = leagueName;
    document.getElementById("header").textContent = leagueName;

    let season, page, id, week;

    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params) {
        if (!(["season", "page", "id", "week"].includes(key))) {
            pageNotFound();
            return;
        }
    }

    if (params.size === 0) {
        season = seasonNames[0];
        page = "standings";
        id = null;
        week = null;
    }
    else {
        season = params.get("season");
        page = params.get("page");
        id = strictParseInt(params.get("id"));
        week = strictParseInt(params.get("week"));
    }

    if (!(seasonNames.includes(season))) {
        pageNotFound();
        return;
    }

    const leagueDataResponse = await fetch(`Seasons/${season}.json`);
    const leagueData = await leagueDataResponse.json();
    const league = new League(leagueData);

    const seasonSelect = document.getElementById("season-select");
    let seasonSelectHTML = ``;
    for (const seasonName of seasonNames) {
        seasonSelectHTML += `<option value="?season=${seasonName}&page=standings"`;

        if (seasonName === season) seasonSelectHTML += ` selected`;
            
        seasonSelectHTML += `>${seasonName}</option>`;
    }
    seasonSelect.innerHTML = seasonSelectHTML;
    seasonSelect.addEventListener("change", function() {
        if (this.value) window.location.href = this.value;
    });

    document.getElementById("nav-buttons").innerHTML = `
        <a href="?season=${season}&page=standings">
            <button id="standings-button">Standings</button>
        </a>
        <a href="?season=${season}&page=schedule&week=0">
            <button id="schedule-button">Schedule</button>
        </a>
        <a href="?season=${season}&page=playoffs">
            <button id="playoffs-button">Playoffs</button>
        </a>
        <a href="?season=${season}&page=tiebreaker">
            <button id="tiebreaker-button">Tiebreaking Procedures</button>
        </a>
    `;

    const content = document.getElementById("content");
    if (
        page === "standings"
        &&
        !id
        &&
        !week
    ) content.innerHTML = displayStandings(league, season);
    else if (
        page === "schedule"
        &&
        !id
        &&
        week >= 0 && week <= league.matchDates.length
    ) {
        content.innerHTML = displaySchedule(league, season, week);
        document.getElementById("week-select").addEventListener("change", function() {
            if (this.value) window.location.href = this.value;
        });
    }
    else if (
        page === "playoffs"
        &&
        !id
        &&
        !week
    ) content.innerHTML = displayPlayoffs(league, season);
    else if (
        page === "tiebreaker"
        &&
        !id
        &&
        !week
    ) content.innerHTML = displayTiebreaker();
    else if (
        page === "team"
        &&
        league.hasTeam(id)
        &&
        !week
    ) content.innerHTML = displayTeam(league, season, id);
    else if (
        page === "match"
        &&
        league.hasMatch(id)
        &&
        league.getMatch(id).week !== "Playoffs" || league.regularSeasonComplete()
        &&
        !week
    ) content.innerHTML = displayMatch(league, season, id);
    else {
        pageNotFound();
        return;
    }
}

main();

//  remaining things to do:
//      a. finish writing 2025 rules and main rules to standings page
//      b. fix matchstructure iterable stuff in League.js? it might be fixed already but just in case
//      1. finalize rankings logic
//          each element of tiebreaker follows this format:
//              {
//                  "tiedRankingOrderIDs": [1, 2, 0]
//              }
//      2. playoff page implementation (podium, bracket visuals, and playoff chances)
//      3. team and match pages (make sure to handle playoff matches appropriately)