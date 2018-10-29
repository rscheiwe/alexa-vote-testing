import * as https from 'https';

const googleCivicApiKey = "AIzaSyDewN5e5BV4POjXDixEnpP4VNcLBBsgMRY";

export function getElections () {

  return new Promise((resolve, reject) => {
    var options = {
      hostname: 'www.googleapis.com',
      port: 443,
      path: `/civicinfo/v2/elections?key=${googleCivicApiKey}`,
      method: 'GET',
    };
    var req = https.request(options, function (res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        // console.log(body);
        let elections = JSON.parse(body);
        // console.log(`Result for GET of ${options.path}:\n`
        //     + JSON.stringify(CandidateData, null, 2));
        resolve(elections);
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
getElections();
