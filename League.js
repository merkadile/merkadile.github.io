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

            team.calculateStatistics(this)
        }

        for (const matchStructureData of data.playoffs.matchStructure) {
            this.playoffStructureMap.set(matchStructureData.matchID, matchStructureData);
        }

        this.teams = this.rankTeams(this.teams, true);

        this.playoffs = data.playoffs;
        this.tiebreakers = data.tiebreakers;
    }

    rankTeams(teamsToRank) {
        for (const team of teamsToRank) {
            team.updateRank(1);
            team.updateRankTie(false);
        }

        teamsToRank.sort((a, b) => b.rankingPoints - a.rankingPoints);

        for (let i = 1; i < teamsToRank.length; i++) {
            if (
                teamsToRank[i].rankingPoints
                ===
                teamsToRank[i - 1].rankingPoints
            ) teamsToRank[i].updateRank(teamsToRank[i - 1].rank);
            else teamsToRank[i].updateRank(i + 1);
        }

        //break ties + update rankings

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