var https = require('https');

module.exports = function (app, addon) {

    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });

    app.get('/browse-package-versions', addon.authenticate(), function (originalReq, originalRes) {
            var repoPath = originalReq.query['repoPath'];
        var httpClient = addon.httpClient(originalReq);

            var repoChangeset = repoChangesetUrl(repoPath);
            httpClient.get(repoChangeset, function (changesetErr, changesetResponse, rawChangesetData) {
                var rev = latestRev(rawChangesetData);

                var bintrayRepoFile = bintrayRepoFileUrl(originalReq.query.repoPath, rev);
                httpClient.get(bintrayRepoFile, function (bintrayRepoFileErr, bintrayRepoFileResponse, bintrayRepoFileData) {

                    var options = bintrayRequestOptions(bintrayRepoFileData);
                    requestBintrayPackageInfo(options, originalRes);
                });
            });
        }
    );

    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for (var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }

    function latestRev(rawChangesetData) {
        var changesetData = JSON.parse(rawChangesetData);
        return changesetData.changesets[0].raw_node;
    }

    function repoChangesetUrl(repoPath) {
        return '/api/1.0/repositories/' + repoPath + '/changesets?limit=1'
    }

    function bintrayRepoFileUrl(repoPath, rev) {
        return '/api/1.0/repositories/' + repoPath + '/src/' + rev + '/.bintray-package.json'
    }

    function bintrayRequestOptions(bintrayRepoFileData) {
        var bintrayRepoFileContent = JSON.parse(bintrayRepoFileData).data;
        var bintrayRepoFile = JSON.parse(bintrayRepoFileContent);

        var options = {
            host: 'api.bintray.com',
            port: 443,
            path: '/packages/' + bintrayRepoFile.path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return options;
    }

    function requestBintrayPackageInfo(options, originalRes) {
        var bintrayReq = https.request(options, function (bintrayRes) {
            bintrayRes.setEncoding('utf8');

            var output = '';
            bintrayRes.on('data', function (chunk) {
                output += chunk;
            });

            bintrayRes.on('end', function () {
                var obj = JSON.parse(output);
                console.log("onResult: " + JSON.stringify(obj));
                originalRes.render('browse-package-versions', {
                    title: obj['name'],
                    owner: obj['owner'],
                    repo: obj['repo'],
                    latestVersion: obj['latest_version'],
                    versions: obj['versions']
                });
            });
        });

        bintrayReq.on('error', function (err) {
            originalRes.send('error: ' + err.message);
        });

        bintrayReq.end();
    }
};
