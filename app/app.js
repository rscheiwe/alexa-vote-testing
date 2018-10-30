

// =================================================================================
// App Configuration
// =================================================================================

const {Contests} = require('./host-contests/classContests');
const getContestsData = require('./host-contests/getContestsData')

// SSML abbreviations:
const brk = n => `<break time="${n}ms"/>`;
const VotewithVoice = "Vote with Voice";

const {App} = require('jovo-framework');

const config = {
    logging: true,
    intentMap: {
        'AMAZON.YesIntent': 'YesIntent',
        'AMAZON.NoIntent': 'NoIntent',
        'AMAZON.CancelIntent': 'CancelIntent',
        'AMAZON.RepeatIntent': 'RepeatIntent',
        'AMAZON.HelpIntent': 'HelpIntent',
        'AMAZON.FallbackIntent': 'NoMatch',
    },
    // db: {
    //     type: 'file',
    //     localDbFilename: 'db',
    // },
    db: {
        type: 'dynamodb',
        tableName: 'VotewithVoice-UserData',
        awsConfig: {
            region: 'us-east-1',
            // Don't need these as long as you have ~/.aws/credentials setup, or AWS_* setup in ENV:
            // accessKeyId: 'yourAccessKeyId',
            // secretAccessKey: 'yourSecretAccessKey',
        }
    },
};

const app = new App(config);


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function() {
        this.ask(`Welcome to ${VotewithVoice}!` +
                    ` To get started, ask me about a federal or state election in your ` +
                    ` area, for example: who's running for governor in New York?` +
                    `  `);
    },
    'ContestInStateIntent': async function(contestName, state) {
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate();
        } else if (this.alexaSkill().getIntentConfirmationStatus() !== 'CONFIRMED') {
            this.alexaSkill().dialogConfirmIntent(
                'You want to know who is running for '  + contestName.value +
                ' in ' + state.value +
                ' is that correct?'
            );
        } else if (this.alexaSkill().getIntentConfirmationStatus() === 'CONFIRMED') {
            let contestData = {
                state: state.value,
                contest: contestName.value
            };
            this.toIntent('CandidatesIntent', contestData);
        }
    },
    'CandidatesIntent': function(contestData) {
        loadStateContestData(contestData.state)
        this.tell(`The candidates running for ${contestData['contest']} are`);
    },
});

async function loadStateContestData(state) {
    const StatesOfUSA = {
        "alabama": ["AL"],
        "alaska": ["AK"],
        "arizona": ["AZ"],
        "arkansas": ["AR"],
        "california": ["CA", 'cali'],
        "colorado": ["CO"],
        "connecticut": ["CT"],
        "delaware": ["DE"],
        "florida": ["FL"],
        "georgia": ["GA"],
        "hawaii": ["HI"],
        "idaho": ["ID"],
        "illinois": ["IL"],
        "indiana": ["IN"],
        "iowa": ["IA"],
        "kansas": ["KS"],
        "kentucky": ["KY"],
        "louisiana": ["LA"],
        "maine": ["ME"],
        "maryland": ["MD"],
        "massachusetts": ["MA"],
        "michigan": ["MI"],
        "minnesota": ["MN"],
        "mississippi": ["MS"],
        "missouri": ["MO"],
        "montana": ["MT"],
        "nebraska": ["NE"],
        "nevada": ["NV"],
        "new hampshire": ["NH"],
        "new jersey": ["NJ"],
        "new mexico": ["NM"],
        "new york": ["NY"],
        "north carolina": ["NC"],
        "north dakota": ["ND"],
        "ohio": ["OH"],
        "oklahoma": ["OK"],
        "oregon": ["OR"],
        "rennsylvania": ["PA"],
        "rhode island": ["RI"],
        "south carolina": ["SC"],
        "south dakota": ["SD"],
        "tennessee": ["TN"],
        "texas": ["TX"],
        "utah": ["UT"],
        "vermont": ["VT"],
        "virginia": ["VA"],
        "washington": ["WA"],
        "west virginia": ["WV"],
        "wisconsin": ["WI"],
        "wyoming": ["WY"]
    };

    let stateAbbrv = StatesOfUSA[state.toLowerCase()]
    const ContestsData = await getContestsData.getContestsData(state);
    
    console.log(`==================================================================`)
    console.log(`==================================================================`)
    console.log(`======================${ContestsData}===============================`)
    console.log(`==================================================================`)
    console.log(`==================================================================`)

    // jovo.setSessionAttribute('ContestsData', JSON.stringify(ContestsData));
    // console.log(`Got Contests Data:\n${JSON.stringify(ContestsData, null, 4)}`);
}

const access_token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTk1NjEwMzgsImp0aSI6IkFsZXhhIiwiaXNzIjoiQXBpIiwic3ViIjoiNTZiZDA3YWNjZDEwZmUwMDIzMDAwMDAxIiwicm9sZXMiOnsiYWRtaW5pc3RyYXRvciI6ZmFsc2V9fQ.fpC-9DKhlrww5k_ayhxzHt8KlD7UZvLqMTTa-C4B4af4Xotq2zB7izo0Okmk3NDdnvvVDq0bMwV2s1KoIcwVSQ';


/** 'app' is exported for use as an entrypoint in index: */
module.exports.app = app;


