import * as https from 'https';


/**
 *
 * @param CandidateId 'id' field available in each Contest's array of candidates.
 */
const CandidateId = "5b521a85273fb8000e9927d4";

export function GetCandidateData(CandidateId: string) {

    return new Promise((resolve, reject) => {

        const access_token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTk1NjEwMzgsImp0aSI6IkFsZXhhIiwiaXNzIjoiQXBpIiwic3ViIjoiNTZiZDA3YWNjZDEwZmUwMDIzMDAwMDAxIiwicm9sZXMiOnsiYWRtaW5pc3RyYXRvciI6ZmFsc2V9fQ.fpC-9DKhlrww5k_ayhxzHt8KlD7UZvLqMTTa-C4B4af4Xotq2zB7izo0Okmk3NDdnvvVDq0bMwV2s1KoIcwVSQ';
        var options = {
            hostname: 'api.ballotdatabase.com',
            port: 443,
            path: `/candidates/${CandidateId}?access_token=${access_token}`,
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
                let CandidateData = JSON.parse(body);
                // console.log(`Result for GET of ${options.path}:\n`
                //     + JSON.stringify(CandidateData, null, 2));
                console.log(CandidateData)
                resolve(CandidateData);
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
GetCandidateData(CandidateId);
