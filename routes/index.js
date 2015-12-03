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

    app.get('/associate-package', addon.authenticate(), function (req, res) {
            res.render('associate-package', {
                associatedPackagePath: 'Atlassian Connect'
            });
        }
    );

    app.get('/browse-package-files', addon.authenticate(), function (req, res) {
            var repoPath = req.query['repo_path'];

            var options = {
                host: 'api.bintray.com',
                port: 443,
                path: '/packages/jfrog/jfrog-jars/gradle-bintray-plugin',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var bintrayReq = https.request(options, function (bintrayRes) {
                var output = '';
                console.log(options.host + ':' + bintrayRes.statusCode);
                bintrayRes.setEncoding('utf8');

                bintrayRes.on('data', function (chunk) {
                    output += chunk;
                });

                bintrayRes.on('end', function () {
                    var obj = JSON.parse(output);
                    console.log("onResult: " + JSON.stringify(obj));
                    res.render('browse-package-files', {
                        title: obj['name'],
                        owner: obj['owner'],
                        repo: obj['repo'],
                        latestVersion: obj['latest_version'],
                        versions: obj['versions']
                    });
                });
            });

            bintrayReq.on('error', function (err) {
                res.send('error: ' + err.message);
            });

            bintrayReq.end();

        }
    );

    // Add any additional route handlers you need for views or REST resources here...


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
};
