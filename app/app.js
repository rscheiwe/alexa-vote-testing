
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
    const ContestsData = await getContestsData(state);
    
    console.log(`==================================================================`)
    console.log(`==================================================================`)
    console.log(`======================${ContestsData}===============================`)
    console.log(`==================================================================`)
    console.log(`==================================================================`)

    // jovo.setSessionAttribute('ContestsData', JSON.stringify(ContestsData));
    // console.log(`Got Contests Data:\n${JSON.stringify(ContestsData, null, 4)}`);
}

const access_token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTk1NjEwMzgsImp0aSI6IkFsZXhhIiwiaXNzIjoiQXBpIiwic3ViIjoiNTZiZDA3YWNjZDEwZmUwMDIzMDAwMDAxIiwicm9sZXMiOnsiYWRtaW5pc3RyYXRvciI6ZmFsc2V9fQ.fpC-9DKhlrww5k_ayhxzHt8KlD7UZvLqMTTa-C4B4af4Xotq2zB7izo0Okmk3NDdnvvVDq0bMwV2s1KoIcwVSQ';

function getContestsData(NameOfState) {

    return new Promise((resolve, reject) => {
        //       stateToFips:
        // calls fipsToElections,
        // calls ElectionToBallots,
        // calls returnResults:
        stateToFips(NameOfState);

        /**
         * Final function called once host data has been obtained:
         */
        function returnResults(nameOfState, GeoLoc, FIPS, ContestsData) {

            ContestsData = cleanupBallot(ContestsData);

            //console.log(`ContestsData:`, ContestsData);
            // for (let i = 0; i < ContestsData.length; ++i) {
            //     console.log(`${NameOfState}\t${ContestsData[i].fips}\t${ContestsData[i].title}\t${ContestsData[i].candidates.length}`);
            // }

            // Wrap in an object to store some extra values:
            ContestsData = {
                NameOfState: nameOfState,
                GeoLoc: GeoLoc,
                FIPS: FIPS,
                Contests: ContestsData
            }

            //console.log("Cleaned data:", JSON.stringify(BallotsData, null, 2));

            // Use to capture TEST data:
            // fs.writeFileSync('./TEST_ContestsData.json', JSON.stringify(ContestsData, null, 4));
            // console.log("Success data:\n" + JSON.stringify(ContestsData, null, 4));

            resolve(ContestsData);

        }


        function stateToFips(nameOfState) {

            // Get state Geoloc for API (See const lookup object below)
            let GeoLoc = stateGeoLocs[nameOfState.toLowerCase()];
            if (!GeoLoc) {
                return reject(new Error(`Unidentified US State:` + NameOfState));
            }

            var options = {
                hostname: 'api.ballotdatabase.com',
                port: 443,
                path: '/address/getFips',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTk1NjEwMzgsImp0aSI6IkFsZXhhIiwiaXNzIjoiQXBpIiwic3ViIjoiNTZiZDA3YWNjZDEwZmUwMDIzMDAwMDAxIiwicm9sZXMiOnsiYWRtaW5pc3RyYXRvciI6ZmFsc2V9fQ.fpC-9DKhlrww5k_ayhxzHt8KlD7UZvLqMTTa-C4B4af4Xotq2zB7izo0Okmk3NDdnvvVDq0bMwV2s1KoIcwVSQ',
                    'Content-Type': 'application/json',
                    //'Content-Length': Buffer.byteLength(GeoLoc)
                }
            };

            var req = https.request(options, function (res) {
                var body = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    let result = JSON.parse(body);
                    // console.log(`Result for POST to ${options.path} with body: ${GeoLoc}:\n`
                    //     + JSON.stringify(result, null, 2));
                    fipsToElections(nameOfState, GeoLoc, result.fips);
                });
            });

            req.on('error', function (e) {
                return reject(e);
            });

            // The required body is just the GeoLoc structure:
            req.end(JSON.stringify(GeoLoc));

        }

        function fipsToElections(nameOfState, GeoLoc, FIPS) {

            var options = {
                hostname: 'api.ballotdatabase.com',
                port: 443,
                path: `/elections?fips=${FIPS}&access_token=${access_token}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            };

            var req = https.request(options, function (res) {
                var body = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    let AllElectionData = JSON.parse(body);
                    // console.log(`Result for GET of ${options.path}:\n`
                    //     + JSON.stringify(AllElectionData, null, 2));

                    //console.log(AllElectionData.map(e => `${nameOfState}\t${e.title}`).join('\n'));

                    let GeneralElectionData = AllElectionData.find(e => e.title.toLowerCase().match(/General Election/i));

                    if (!GeneralElectionData) {
                        console.log(`${nameOfState}\tCould not find 'General Election' in elections:`,
                            AllElectionData.map(e => e.title).join(', ')
                        );
                        returnResults(nameOfState, GeoLoc, FIPS, null);
                    } else {
                        electionToBallots(nameOfState, GeoLoc, FIPS, GeneralElectionData);
                    }
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            req.end();

        }


        function electionToBallots(nameOfState, GeoLoc, FIPS, GeneralElectionData) {

            var options = {
                hostname: 'api.ballotdatabase.com',
                port: 443,
                path: `/location/ballot?eid=${GeneralElectionData.id}&fips=${FIPS}&lat=${GeoLoc.lat}&lng=${GeoLoc.lng}&access_token=${access_token}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            };

            // console.log(`electionToBallots():Hitting REST GET:`, options.path);

            var req = https.request(options, function (res) {
                var body = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    let ContestsData = JSON.parse(body);
                    // console.log(`Result for GET of ${options.path}:\n`
                    //     + JSON.stringify(BallotsData, null, 2));

                    fs.writeFileSync('./TEST_ContestsData.json', JSON.stringify(ContestsData, null, 4));


                    returnResults(nameOfState, GeoLoc, FIPS, ContestsData);
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            req.end();

        }

        /**
         * Function obtained from Alexa demo code in utils.js:
         * @param {*} boxes
         */
        const cleanupCandidates = function (candidates) {

            const newCandidates = [];

            for (let cand of candidates) {
                newCandidates.push({
                    id: cand.id,
                    title: cand.title,
                    party: cand.party
                });
            }

            return newCandidates;
        }

        /**
         * Function obtained from Alexa demo code in utils.js:
         * @param {*} boxes
         */
        const cleanupBallot = function (boxes) {

            if (!boxes) return boxes;

            const newBoxes = [];

            for (let box of boxes) {
                // if (box.type === 'header' || box.type === 'question') {
                if (!box.notes || !box.notes.match(/#statewide/i)) {
                    console.log(`cleanupBallot():Ignoring box:`, JSON.stringify(box));
                    // Remove item:
                    // boxes.splice(i, 1);
                } else {
                    newBoxes.push({
                        id: box.id,
                        title: box.title
                            .replace(/\b(US|U\.S\.)/g, "United States")
                            .replace(/\bLT\./ig, "Lieutenant")
                            .replace(/Lieutentant/ig, "Lieutenant"),
                        fips: box.fips,
                        type: box.type,
                        adminStatus: box.adminStatus,
                        candidates: cleanupCandidates(box.candidates)
                    })
                }
            }
            return newBoxes;

            /*

                //box.title = box.title.trim();
                box.title = box.title
                    .replace(/\b(US|U\.S\.)/g, "United States")
                    .replace(/\bLT\./ig, "Lieutenant")
                    .replace(/Lieutentant/ig, "Lieutenant")
                    .replace(/^Attorney General$/ig, "State Attorney General")
                    .replace(/Governor and Lieutenant Governor/ig, "Governor")
                    .replace(/United States House of Representatives/ig, "United States Representative")
                    .replace(/United States Representative.+$/ig, "United States Representative");
            }

            // At this point just filtering it so we only get these elections:
            // (1) US House of Representative,
            // (2) US Senate,
            // (3) Governor,
            // (4) Lieutenant Governor,
            // (5) State Attorney General,
            // (6) State Supreme Court

            // We do this by creating a new boxes array, so that we can ensure the final order:
            let newBoxes = [];
            for (let contestName of ['United States Representative', 'United States Senator', 'Governor', 'Lieutenant Governor', 'State Attorney General']) {
                let idx = boxes.findIndex(b => b.title === contestName);
                if (idx >= 0) {
                    newBoxes.push(boxes.splice(idx, 1)[0]);
                }
            }
            // For debug purposes, list out the ones left behind:
            // for (let box of boxes)
            //     console.error(`Ignored non-matching ballot name: ${box.title}`);

            return newBoxes;
            */
        };

    });



}

const stateGeoLocs = {
    alabama: { lat: 32.806671, lng: -86.791130 },
    alaska: { lat: 61.370716, lng: -152.404419 },
    arizona: { lat: 33.729759, lng: -111.431221 },
    arkansas: { lat: 34.969704, lng: -92.373123 },
    california: { lat: 36.116203, lng: -119.681564 },
    colorado: { lat: 39.059811, lng: -105.311104 },
    connecticut: { lat: 41.597782, lng: -72.755371 },
    delaware: { lat: 39.318523, lng: -75.507141 },
    'district of columbia': { lat: 38.897438, lng: -77.026817 },
    florida: { lat: 27.766279, lng: -81.686783 },
    georgia: { lat: 33.040619, lng: -83.643074 },
    hawaii: { lat: 21.094318, lng: -157.498337 },
    idaho: { lat: 44.240459, lng: -114.478828 },
    illinois: { lat: 40.349457, lng: -88.986137 },
    indiana: { lat: 39.849426, lng: -86.258278 },
    iowa: { lat: 42.011539, lng: -93.210526 },
    kansas: { lat: 38.526600, lng: -96.726486 },
    kentucky: { lat: 37.668140, lng: -84.670067 },
    louisiana: { lat: 31.169546, lng: -91.867805 },
    maine: { lat: 44.693947, lng: -69.381927 },
    maryland: { lat: 39.063946, lng: -76.802101 },
    massachusetts: { lat: 42.230171, lng: -71.530106 },
    michigan: { lat: 43.326618, lng: -84.536095 },
    minnesota: { lat: 45.694454, lng: -93.900192 },
    mississippi: { lat: 32.741646, lng: -89.678696 },
    missouri: { lat: 38.456085, lng: -92.288368 },
    montana: { lat: 46.921925, lng: -110.454353 },
    nebraska: { lat: 41.125370, lng: -98.268082 },
    nevada: { lat: 38.313515, lng: -117.055374 },
    'new hampshire': { lat: 43.452492, lng: -71.563896 },
    'new jersey': { lat: 40.298904, lng: -74.521011 },
    'new mexico': { lat: 34.840515, lng: -106.248482 },
    'new york': { lat: 42.165726, lng: -74.948051 },
    'north carolina': { lat: 35.630066, lng: -79.806419 },
    'north dakota': { lat: 47.528912, lng: -99.784012 },
    ohio: { lat: 40.388783, lng: -82.764915 },
    oklahoma: { lat: 35.565342, lng: -96.928917 },
    oregon: { lat: 44.572021, lng: -122.070938 },
    pennsylvania: { lat: 40.590752, lng: -77.209755 },
    'rhode island': { lat: 41.680893, lng: -71.511780 },
    'south carolina': { lat: 33.856892, lng: -80.945007 },
    'south dakota': { lat: 44.299782, lng: -99.438828 },
    tennessee: { lat: 35.747845, lng: -86.692345 },
    texas: { lat: 31.054487, lng: -97.563461 },
    utah: { lat: 40.150032, lng: -111.862434 },
    vermont: { lat: 44.045876, lng: -72.710686 },
    virginia: { lat: 37.769337, lng: -78.169968 },
    washington: { lat: 47.400902, lng: -121.490494 },
    'west virginia': { lat: 38.491226, lng: -80.954453 },
    wisconsin: { lat: 44.268543, lng: -89.616508 },
    wyoming: { lat: 42.755966, lng: -107.302490 }
};



/** 'app' is exported for use as an entrypoint in index: */
module.exports.app = app;


