class Team {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.acronym = data.acronym;
        this.color = data.color;
        this.players = data.players;
    }

    calculateStatistics(league) {
        this.schedule = [];

        this.wins = 0;
        this.losses = 0;
        this.ties = 0;

        this.netGames = 0;
        this.netScore = 0;

        for (const match of league.matches) {
            if (match.week !== "Playoffs" && (
                match.team1ID === this.id || match.team2ID === this.id
            )) {
                this.schedule.push(match);

                if (match.isComplete()) {
                    if (match.winnerID == this.id) this.wins++;
                    else if (match.winnerID == null) this.ties++;
                    else this.losses++;

                    if (match.team1ID == this.id) {
                        this.netGames += match.team1GameWins - match.team2GameWins;
                        this.netScore += match.team1NetScore;
                    }
                    else {
                        this.netGames += match.team2GameWins - match.team1GameWins;
                        this.netScore += match.team2NetScore;
                    }
                }
            }
        }

        this.gamesPlayed = this.wins + this.losses + this.ties;
        this.rankingPoints = this.wins * 2 + this.ties;
        this.wtlPerc = (this.gamesPlayed == 0)? 0: (
            this.rankingPoints / (2 * this.gamesPlayed)
        );

        this.rank = 1;
        this.rankTie = false;
    }

    updateRank(rank) {
        this.rank = rank;
    }

    updateRankTie(rankTie) {
        this.rankTie = rankTie;
    }
}