
// 'use strict';
// const https = require('https');
// let parameters = { ToPhoneNumber: '+61414998437', Selections: 'A, B, C' };

// // ###################### CUT HERE ###################


const https = require('https');


const TwilioSid = 'AC978e521b9ac4b2ef0d3974f211439aad';
const TwilioToken = '25c0453511ecdf9354bdca4c97ab1659';
const TwilioFromNumber = '+14243534199';


export function SendTextMessage(toNumber: string, message: string) {

    // curl 'https://api.twilio.com/2010-04-01/Accounts/AC978e521b9ac4b2ef0d3974f211439aad/Messages.json' \
    // --data-urlencode 'To=+61414998437' \
    // --data-urlencode 'From=+14243534199' \
    // --data-urlencode 'Body=These are your selections {Selections}' \
    // -u 'AC978e521b9ac4b2ef0d3974f211439aad:25c0453511ecdf9354bdca4c97ab1659'


    return new Promise((resolve, reject) => {

        var options = {
            hostname: 'api.twilio.com',
            port: 443,
            path: `/2010-04-01/Accounts/${TwilioSid}/Messages.json`,
            method: 'POST',
            auth: `${TwilioSid}:${TwilioToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        message = encodeURIComponent(message);
        // console.log(`SendTextMessage:Message encoded to: '${message}'`);

        const body = `To=${encodeURIComponent(toNumber)}` +
            `&From=${encodeURIComponent(TwilioFromNumber)}` +
            // `&MessagingServiceSid=${encodeURI('Live Ballot')}` +
            `&Body=${message}`;

        var req = https.request(options, function (res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                let result = JSON.parse(body);
                // console.log(`Result for POST to ${options.path}:\n`
                //     + JSON.stringify(result, null, 2));
                resolve(result);
                // fipsToElections(nameOfState, GeoLoc, result.fips);
            });
        });

        req.on('error', function (e) {
            reject(e);
        });

        req.end(body);

    });   // - End new Promise

}
