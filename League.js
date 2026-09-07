class League {
    constructor(data) {
        this.matchDates = data.matchDates;
        this.mainRules = data.mainRules;

        this.teams = [];
        this.matches = [];

        this.matchMap = new Map();
        this.teamMap = new Map();
        this.playoffStructureMap = new Map();

        for (const matchData of data.matches) {
            const match = new Match(matchData);

            this.matches.push(match);
            this.matchMap.set(match.id, match);
        }

        for (const teamData of data.teams) {
            const team = new Team(teamData);

            this.teams.push(team);
            this.teamMap.set(team.id, team);

            team.calculateStatistics(this);
        }

        for (const matchStructureData of data.playoffs.matchStructure) {
            this.playoffStructureMap.set(matchStructureData.matchID, matchStructureData);
        }

        this.playoffs = data.playoffs;
        this.tiebreakers = data.tiebreakers;

        this.teams = this.rankTeams(this.teams);
    }

    rankTeams(teamsToRank) {
        for (const team of teamsToRank) {
            team.updateRank(1);
            team.updateRankTie(false);
        }

        this.sortDescByField(teamsToRank, 1, "rankingPoints", null);

        teamsToRank.sort((a, b) => a.rank - b.rank);

        for (let i = 0; i < teamsToRank.length; i++) if (
            ((i > 0) && (
                teamsToRank[i].rank
                ===
                teamsToRank[i - 1].rank
            ))
            ||
            ((i < teamsToRank.length - 1) && (
                teamsToRank[i].rank
                ===
                teamsToRank[i + 1].rank
            ))
        ) teamsToRank[i].updateRankTie(true);

        return teamsToRank;
    }

    sortDescByField(teamsToSort, topRank, field, fieldExternalSource) {
        if (fieldExternalSource === null) teamsToSort.sort((a, b) => b[field] - a[field]);
        else teamsToSort.sort((a, b) => 
            fieldExternalSource.find(info => info.team === b)[field]
            -
            fieldExternalSource.find(info => info.team === a)[field]
        );

        teamsToSort[0].updateRank(topRank);
        
        let tieInfo = [];
        let curRank = topRank;
        let numTeamsAtRank = 1;
        for (let i = 1; i < teamsToSort.length; i++) {
            let curTeamField, prevTeamField;
            if (fieldExternalSource === null) {
                curTeamField = teamsToSort[i][field];
                prevTeamField = teamsToSort[i - 1][field];
            }
            else {
                curTeamField = fieldExternalSource.find(info => info.team === teamsToSort[i])[field];
                prevTeamField = fieldExternalSource.find(info => info.team === teamsToSort[i - 1])[field];
            }

            if (Math.abs(curTeamField - prevTeamField) > 0.000001) {
                if (numTeamsAtRank > 1) {
                    let tiedTeams = [];
                    for (let j = numTeamsAtRank; j > 0; j--) tiedTeams.push(teamsToSort[i - j]);
                    tieInfo.push({"tiedTeams": tiedTeams, "tiedRank": curRank});
                }

                curRank = i + topRank;
                numTeamsAtRank = 0;
            }            

            teamsToSort[i].updateRank(curRank);
            numTeamsAtRank++;
        }

        if (numTeamsAtRank > 1) {
            let tiedTeams = [];
            for (let j = numTeamsAtRank; j > 0; j--) tiedTeams.push(teamsToSort[teamsToSort.length - j]);
            tieInfo.push({"tiedTeams": tiedTeams, "tiedRank": curRank});
        }

        for (const tie of tieInfo) this.breakTie(tie.tiedTeams, tie.tiedRank);
    }

    breakTie(tiedTeams, tiedRank) {
        //calculate head to head statistics
        let hthStats = [];
        for (const team of tiedTeams) {
            let numMatches = 0;
            let hthRP = 0;
            let hthNetGames = 0;
            let hthNetScore = 0;

            for (const match of team.schedule) {
                if (match.isComplete()) {
                    const otherTeamID = (match.team1ID === team.id)? match.team2ID: match.team1ID;

                    let otherTeamInTie = false;
                    for (const testTeam of tiedTeams) if (testTeam.id === otherTeamID) {
                        otherTeamInTie = true;
                        break;
                    }

                    if (otherTeamInTie) {
                        if (match.winnerID === null) hthRP += 1;
                        else if (match.winnerID === team.id) hthRP += 2;
                        numMatches++;

                        hthNetGames += (
                            ((match.team1ID === team.id)? 1: -1)
                            *
                            (match.team1GameWins - match.team2GameWins)
                        );

                        hthNetScore += (match.team1ID === team.id)? match.team1NetScore: match.team2NetScore;
                    }
                }
            }

            let hthWTL = (numMatches === 0)? 0: (hthRP / (numMatches * 2));

            hthStats.push({"team": team, "hthWTL": hthWTL, "hthNetGames": hthNetGames, "hthNetScore": hthNetScore});
        }

        //1. sort by HtH WTL%
        for (let i = 1; i < hthStats.length; i++) if (Math.abs(hthStats[0].hthWTL - hthStats[i].hthWTL) > 0.000001) {
            this.sortDescByField(tiedTeams, tiedRank, "hthWTL", hthStats);
            return;
        }

        //2. sort by HtH Net Games
        for (let i = 1; i < hthStats.length; i++) if (hthStats[0].hthNetGames !== hthStats[i].hthNetGames) {
            this.sortDescByField(tiedTeams, tiedRank, "hthNetGames", hthStats);
            return;
        }

        //3. sort by HtH Net Score
        for (let i = 1; i < hthStats.length; i++) if (hthStats[0].hthNetScore !== hthStats[i].hthNetScore) {
            this.sortDescByField(tiedTeams, tiedRank, "hthNetScore", hthStats);
            return;
        }

        //4. sort by overall WTL%
        for (let i = 1; i < tiedTeams.length; i++) if (Math.abs(tiedTeams[0].wtlPerc - tiedTeams[i].wtlPerc) > 0.000001) {
            this.sortDescByField(tiedTeams, tiedRank, "wtlPerc", null);
            return;
        }

        //5. sort by overall Net Games
        for (let i = 1; i < tiedTeams.length; i++) if (tiedTeams[0].netGames !== tiedTeams[i].netGames) {
            this.sortDescByField(tiedTeams, tiedRank, "netGames", null);
            return;
        }

        //6. sort by overall Net Score
        for (let i = 1; i < tiedTeams.length; i++) if (tiedTeams[0].netScore !== tiedTeams[i].netScore) {
            this.sortDescByField(tiedTeams, tiedRank, "netScore", null);
            return;
        }
    
        //if it gets to this point we have to break the tie manually
        let tiebreakerInfo = [];
        for (const tiebreaker of this.tiebreakers) {
            if (tiedTeams.includes(this.getTeam(tiebreaker[0]))) {
                for (let i = 0; i < tiebreaker.length; i++) tiebreakerInfo.push(
                    {"team": this.getTeam(tiebreaker[i]), "tiePoints": (tiebreaker.length - i)}
                );

                break;
            }
        }
        if (tiebreakerInfo.length > 0) this.sortDescByField(tiedTeams, tiedRank, "tiePoints", tiebreakerInfo);
    }

    getTeam(id) {
        return this.teamMap.get(id);
    }

    hasTeam(id) {
        return this.teamMap.has(id);
    }

    getMatch(id) {
        return this.matchMap.get(id);
    }

    hasMatch(id) {
        return this.matchMap.has(id);
    }

    getPlayoffMatchStructure(id) {
        return this.playoffStructureMap.get(id);
    }

    hasPlayoffMatchStructure(id) {
        return this.playoffStructureMap.has(id);
    }

    regularSeasonComplete() {
        for (const team of this.teams) if (team.rankTie) return false;

        let incompleteMatchFound = false;

        for (const match of this.matches) {
            if (match.week !== "Playoffs" && !(match.isComplete())) {
                incompleteMatchFound = true;
                break;
            }
        }

        return !(incompleteMatchFound);
    }

    playoffsComplete() {
        let incompleteMatchFound = false;

        for (const match of this.matches) {
            if (match.week === "Playoffs" && !(match.isComplete())) {
                incompleteMatchFound = true;
                break;
            }
        }

        return !(incompleteMatchFound);
    }
}