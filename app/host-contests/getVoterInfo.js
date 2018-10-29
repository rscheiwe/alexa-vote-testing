import * as https from 'https';

const googleCivicApiKey = 'AIzaSyDewN5e5BV4POjXDixEnpP4VNcLBBsgMRY';
const address = '111%20John%20Street';
const electionId = '6000';

// GET https://www.googleapis.com/civicinfo/v2/voterinfo

export function getVoterInfo () {

  return new Promise((resolve, reject) => {
    var options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: `/civicinfo/v2/voterinfo?address=${address}&electionId=${electionId}&key=${googleCivicApiKey}`,
      method: 'GET',
    };
    // console.log(options);
    var req = https.request(options, function (res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        let voterInfo = JSON.parse(body);
        // console.log(`Result for GET of ${options.path}:\n`
        //             + JSON.stringify(voterInfo, null, 2));
        // console.log(voterInfo);
        resolve(voterInfo);
      });
    });
    req.on('error', function (e) {
      reject(e);
    });

    req.end();

    // const partyMap = {
    //     rep: 'Republican',
    //     dem: 'Democrat',
    //     lib: 'Libertarian',
    //     grn: 'Green Party',
    //     aid: 'American Independent',
    //     ind: 'Independent',
    //     paf: 'Peace and Freedom',
    //     tea: 'Tea Party',
    // };

  });   // - end New Promise

}
getVoterInfo();
