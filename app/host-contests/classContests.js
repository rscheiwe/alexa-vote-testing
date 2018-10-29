
/**
 * Class created from Contests Data:
 * (The constructor pulls the data from jovo session attributes)
 */
class Contests {

    // Contests.data = {}

    constructor() {
        this.jovo = jovo
        const ContestsData = jovo.getSessionAttribute('ContestsData');
        //console.log(`Contests.constructor():Got ContestsData:`, ContestsData);
        if (ContestsData) {
            this.data = JSON.parse(ContestsData);
            // Make sure this is an array for methods below:
            if (!this.data.Contests) this.data.Contests = [];
        } else {
            // This should never happen really:
            console.warn(`classContests.contructor():Null ContestsData in session. Not expected!`);
            this.data = { Contests: [] };
        }
    }

    getContests() {
        return this.data.Contests;
    }

    getNumberOf() {
        return this.data.Contests.length;
    }

    getTitles() {
        return this.data.Contests.map(c => c.title);
    }

    getTitlesPrompt(startIndex=0, maxOf=0) {
        if (startIndex > this.data.Contests.length)
            return '';

        let stopIndex = startIndex + maxOf - 1;
        if (stopIndex > this.data.Contests.length)
            stopIndex = this.data.Contests.length

        let prompt = '';
        for (let i = startIndex; i <= stopIndex; ++i) {
            if (i > startIndex) {
                prompt += '; ';
                if (i === stopIndex)
                    prompt += 'and ';
            }
            // '-1' - Arrays start at 0:
            prompt += this.data.Contests[i - 1].title;
        }

        return prompt;
    }

    findContestIndex(NameSaid='') {
        try {
            return this.data.Contests.findIndex(c => c.title.toLowerCase() === NameSaid.toLowerCase());
        } catch (err) {
            console.warn(`findContestIndex():Failed to find contest name: '${NameSaid}'`);
            return -1;
        }
    }

    findContest(NameSaid='') {
        const index = this.findContestIndex(NameSaid);
        if (index >= 0) {
            return this.data.Contests[index];
        } else {
            return null;
        }
    }

    findCandidateIndex(ContestName='', NameSaid='') {
        const contest = this.findContest(ContestName);

        return contest.candidates.findIndex(c => c.title.toLowerCase() === NameSaid.toLowerCase());
    }


    findCandidate(ContestName='', NameSaid='') {

        const contest = this.findContest(ContestName);

        let index = this.findCandidateIndex(ContestName, NameSaid);

        // Didn't find exact match, look for partial match via 'includes()':
        if (index < 0) {
            let partMatches = contest.candidates.filter(
                c => c.title.toLowerCase().includes(NameSaid.toLowerCase()));
            // If exactly one partial match, we say close enough:
            if (partMatches.length === 1)
                // Find index based on found title (name)
                index = this.findCandidateIndex(ContestName, partMatches[0].title);
        }

        if (index >= 0) {
            return contest.candidates[index];
        } else {
            console.warn(`findCandidate():Failed to find Candidate name: '${NameSaid}'`);
            return null;
        }
    }

}

module.exports = Contests
