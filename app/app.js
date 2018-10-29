'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {Contests} = require('./host-contests/classContests');

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
    'ContestInStateIntent': function(contest, state) {
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate();
        } else if (this.alexaSkill().getIntentConfirmationStatus() !== 'CONFIRMED') {
            this.alexaSkill().dialogConfirmIntent(
                'You want to know who is running for ' + contest.value +
                ' in ' + state.value +
                ' is that correct?'
            );
        } else if (this.alexaSkill().getIntentConfirmationStatus() === 'CONFIRMED') {
            let flightData = {
                contest: contest.value,
                state: state.value
            };
            this.toIntent('FlightApiIntent', flightData);
        }
    },
    'FlightApiIntent': function(flightData) {
        // console.log(flightData);
        this.tell('Your flight is booked, thanks!');
    },
});

/** 'app' is exported for use as an entrypoint in index: */
module.exports.app = app;


