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
        `;

        html += `<td class="right-align`;
        if (team.netGames > 0) html += ` positive-net-value">+${team.netGames}</td>`;
        else if (team.netGames < 0) html += ` negative-net-value">${team.netGames}</td>`;
        else html += `">${team.netGames}</td>`;

        html += `<td class="right-align`;
        if (team.netScore > 0) html += ` positive-net-value">+${team.netScore}</td>`;
        else if (team.netScore < 0) html += ` negative-net-value">${team.netScore}</td>`;
        else html += `">${team.netScore}</td>`;

        html += `
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
        <span class="main-rules">
            <h3>League Rules:</h3>
    `;

    html += printArrayAsList(league.mainRules);

    html += `
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
                        ${team1.name} (${team1.acronym}) vs. ${team2.name} (${team2.acronym})
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
    
    html = `
        <h2>Playoffs</h2>
    `;

    html += `
        <span class="playoff-rules">
            <h3>Playoff Rules:</h3>
    `;

    html += printArrayAsList(league.playoffs.rules);

    html += `
        </span>
        <p>This page is still in development... stay tuned!</p>
    `;

    return html;
}

function displayTiebreaker() {
    document.getElementById("tiebreaker-button").classList.add("active");

    return `
        <h2>Tiebreaking Procedures</h2>
        <span class="tiebreaker-main">
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
        </span>
        <p class="tiebreaker-footnote">*If after one of these steps the tie is broken but a smaller tie between two or more teams remains, seed the teams that have broken out of the tie appropriately and start at the beginning of the tie procedures for the remaining teams.</p>
    `;
}

function displayTeam(league, season, teamID) {
    const team = league.getTeam(teamID);

    let rankSuffix = "th";
    if (team.rank % 10 === 1 && team.rank % 100 !== 11) rankSuffix = "st";
    else if (team.rank % 10 === 2 && team.rank % 100 !== 12) rankSuffix = "nd";
    else if (team.rank % 10 === 3 && team.rank % 100 !== 13) rankSuffix = "rd";
    const rankString = team.rankTie? `T-${team.rank}${rankSuffix}`: `${team.rank}${rankSuffix}`;

    const ptsString = (team.rankingPoints === 1)? `${team.rankingPoints} PT`: `${team.rankingPoints} PTS`;

    const netGamesSign = (team.netGames > 0)? "+": "";
    const netScoreSign = (team.netScore > 0)? "+": "";

    const netGamesStyle = (team.netGames > 0)? "positive": ((team.netGames < 0)? "negative": "neutral");
    const netScoreStyle = (team.netScore > 0)? "positive": ((team.netScore < 0)? "negative": "neutral");

    let html = `
        <div style="--team-color: ${team.color};">
            <div class="team-header">
                <h2>${team.name}</h2>
                <div class="team-summary">
                    <span>${team.wins} - ${team.losses} - ${team.ties}</span>
                    <span>${ptsString}</span>
                    <span>${rankString} Place</span>
                </div>
            </div>

            <div class="team-grid">
                <section class="team-card schedule-card">
                    <div class="team-card-header">Schedule</div>
                    <div class="team-schedule">
    `;

    for (const match of team.schedule) {
        const otherTeam = league.getTeam(
            ((match.team1ID === team.id)? match.team2ID: match.team1ID)
        );

        html += `
            <div class="row">
                <span class="week">Week ${match.week}</span>
                <span class="opponent">
                    <a href="?season=${season}&page=match&id=${match.id}">vs. ${otherTeam.name}</a>
                </span>
                <span class="result">
        `;

        if (match.isComplete()) {
            let thisGameWins, otherGameWins, result;

            if (match.team1ID === team.id) {
                thisGameWins = match.team1GameWins;
                otherGameWins = match.team2GameWins;
            }
            else {
                thisGameWins = match.team2GameWins;
                otherGameWins = match.team1GameWins;
            }

            if (match.winnerID === null) result = "T";
            else if (match.winnerID === team.id) result = "W";
            else result = "L";

            html += `<span class="result-${result}">${result} </span><span class="gamesWon">(${thisGameWins}-${otherGameWins})</span>`
        }
        else html += `<span class="result-TBD">TBD</span>`;

        html += `</span></div>`;
    }

    html += `
            </div>
        </section>

        <section class="team-card players-card">
            <div class="team-card-header">Players</div>
            <div class="player-list">
    `;

    for (const player of team.players) html += `<span>${player}</span>`;

    html += `
                    </div>
                </section>

                <section class="team-card stats-card">
                    <div class="team-card-header">Stats</div>
                    <div class="stats-grid">
                        <div>
                            <span class="stat-label">Win-Tie-Loss Percent</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-neutral">${team.wtlPerc.toFixed(3).replace(/^0/, "")} </span>
                                <span class="stat-ranking">(${league.getStatRanking("wtlPerc", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Game Winning Percent</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-neutral">${team.gameWinPerc.toFixed(3).replace(/^0/, "")} </span>
                                <span class="stat-ranking">(${league.getStatRanking("gameWinPerc", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Net Games Won/Lost</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-${netGamesStyle}">${netGamesSign}${team.netGames} </span>
                                <span class="stat-ranking">(${league.getStatRanking("netGames", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Net Score For/Against</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-${netScoreStyle}">${netScoreSign}${team.netScore} </span>
                                <span class="stat-ranking">(${league.getStatRanking("netScore", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Avg. Games Won per Match</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-neutral">${team.avgGamesWonPerMatch.toFixed(2)} </span>
                                <span class="stat-ranking">(${league.getStatRanking("avgGamesWonPerMatch", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Avg. Games Lost per Match</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-neutral">${team.avgGamesLostPerMatch.toFixed(2)} </span>
                                <span class="stat-ranking">(${league.getStatRanking("avgGamesLostPerMatch", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Avg. Score For per Game</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-neutral">${team.avgScoreForPerGame.toFixed(1)} </span>
                                <span class="stat-ranking">(${league.getStatRanking("avgScoreForPerGame", team.id)})</span>
                            </span>
                        </div>
                        <div>
                            <span class="stat-label">Avg. Score Against per Game</span>
                            <span class="stat-value-rank">
                                <span class="stat-value-neutral">${team.avgScoreAgainstPerGame.toFixed(1)} </span>
                                <span class="stat-ranking">(${league.getStatRanking("avgScoreAgainstPerGame", team.id)})</span>
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;
    
    return html;
}

function displayMatch(league, season, matchID) {
    const match = league.getMatch(matchID);
    let team1, team2;

    let html = ``;
    
    if (match.week === "Playoffs") {
        const playoffMatchStructure = league.getPlayoffMatchStructure(matchID);
        const bracketName = league.playoffs.bracketNames[
            playoffMatchStructure.bracketIndex
        ];
        const roundName = league.playoffs.roundNames[
            playoffMatchStructure.roundIndex
        ];

        team1 = findPlayoffTeam(league, playoffMatchStructure.teamSlots[0]);
        team2 = findPlayoffTeam(league, playoffMatchStructure.teamSlots[1]);

        const team1Name = (team1 === null)? "[TBD]": team1.name;
        const team2Name = (team2 === null)? "[TBD]": team2.name;

        html += `<h2>${team1Name} vs. ${team2Name} - `;

        if (roundName !== null) html += `${roundName}`;
        else html += `Playoffs`;

        if (bracketName !== null) html += ` (${bracketName})`;

        html += `</h2>`;
    }
    else {
        team1 = league.getTeam(match.team1ID);
        team2 = league.getTeam(match.team2ID);

        html += `
            <h2>${team1.name} vs. ${team2.name} - Week ${match.week}</h2>
        `;
    }

    if (team1 === null || team2 === null || !(match.isComplete())) {
        //TODO: display card with match time/date/location
    }
    else {
        //TODO: display detailed match results
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

function printArrayAsList(arr) {
    let html = `<ul>`;

    for (const elem of arr) {
        if (Array.isArray(elem)) html += printArrayAsList(elem);
        else html += `<li>${elem}</li>`;
    }

    html += `</ul>`

    return html;
}

function findPlayoffTeam(league, teamSlot) {
    if (teamSlot.sourceType === "rankings") return league.teams[teamSlot.rank - 1];
    else if (teamSlot.sourceType === "match") {
        const sourceMatch = league.getMatch(teamSlot.matchID);
        const sourceMatchStructure = league.getPlayoffMatchStructure(teamSlot.matchID)

        if (!(sourceMatch.isComplete())) return null;
        else if (teamSlot.result === "winner") return findPlayoffTeam(
            league, sourceMatchStructure.teamSlots[sourceMatch.winner - 1]
        );
        else if (teamSlot.result === "loser") return findPlayoffTeam(
            league, sourceMatchStructure.teamSlots[2 - sourceMatch.winner]
        );
        else return null;
    }
    else return null;
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
        (league.getMatch(id).week !== "Playoffs" || league.regularSeasonComplete())
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
//      1. add forfeit mechanics to the league (most likely would go into the match class, but i need to check everything in case somewhere else relies on the number of games won to determine winning)
//      2. change it so schedule page and team page and match page indicate if there's been a forfeit (for example: WAR 2 - 2(F) SYC, indicating that WAR won the match because SYC forfeited)
//      3. update rules for what uncle e and i talked about
//      4. add dividers and odd/even table coloring to player grid and refine/consolidate css from team stuff
//      5. match pages
//      6. playoff page implementation (podium, bracket visuals, and playoff chances)
