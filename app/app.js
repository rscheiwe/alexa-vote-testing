'use strict';

// =================================================================================
// App Configuration
// =================================================================================

import { Contests } from './host-contests/classContests';

// SSML abbreviations:
const brk = n => `<break time="${n}ms"/>`;
const VotewithVoice = "Vote with Voice";

const {App} = require('jovo-framework');

const config = {
    logging: true,
};

const app = new App(config);


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function() {
        this.ask('Where are you flying to?');
    },
    'SearchFlightIntent': function(fromCity, toCity, date, ticketCount) {
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate();
        } else if (!this.alexaSkill().hasSlotValue('ticketCount')) {
            this.alexaSkill().dialogElicitSlot('ticketCount', 'How many tickets do you need?');
        } else if (this.alexaSkill().getIntentConfirmationStatus() !== 'CONFIRMED') {
            this.alexaSkill().dialogConfirmIntent(
                'So you are flying from ' + fromCity.value +
                ' to ' + toCity.value +
                ' on ' + date.value +
                ' and you need ' + ticketCount.value + ' tickets, right?'
            );
        } else if (this.alexaSkill().getIntentConfirmationStatus() === 'CONFIRMED') {
            let flightData = {
                fromCity: fromCity.value,
                toCity: toCity.value,
                date: date.value,
                ticketCount: ticketCount.value,
            };
            this.toIntent('FlightApiIntent', flightData);
        }
    },
    'FlightApiIntent': function(flightData) {
        console.log(flightData);
        this.tell('Your flight is booked, thanks!');
    },
});

/** 'app' is exported for use as an entrypoint in index: */
module.exports.app = app;
