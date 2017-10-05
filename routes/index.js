var https = require('https');
var http = require('http');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var url = require('url');
var jwt = require('atlassian-jwt');
var ac = require('atlassian-connect-express')


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

    app.post('/associate-user', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
            var bitBucketUsername = req.bitBucketUsername;
            var bintrayUsername = req.body.username;
            var apiKey = req.body.apiKey;

            var BintrayUser = getBintrayUser();
            BintrayUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Bintray user: ' + err.message);
                    return;
                }
                if (data == null) {
                    var newUser = new BintrayUser({
                        bitBucketUsername: bitBucketUsername,
                        bintrayUsername: bintrayUsername,
                        apiKey: apiKey
                    });
                    newUser.save(function (err) {
                        if (err) {
                            res.send('Error occurred while creating a new associated Bintray user:' + err.message);
                        } else {
                            console.log('BINTRAY: CREATING NEW ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bintrayUsername);
                        }
                    });
                } else {
                    data.bintrayUsername = bintrayUsername;
                    data.apiKey = apiKey;
                    data.save(function (err) {
                        if (err) {
                            res.send('Error occurred while updating associated Bintray user:' + err.message);
                        } else {
                            console.log('BINTRAY: UPDATING EXISTING ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bintrayUsername);
                        }
                    });
                }
            });
            res.render('associate-user', {username: bintrayUsername, apiKey: apiKey});
        }
    );

    app.get('/associate-user', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername
        var BintrayUser = getBintrayUser();
        BintrayUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bintray user: ' + err.message);
                return;
            }
            if (data == null) {
                res.render('associate-user', {username: null, apiKey: null});
            } else {
                res.render('associate-user', {username: data.bintrayUsername, apiKey: data.apiKey})
            }
        });
    });

    app.post('/artifactory-user', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var url = req.body.url;
        var artifactoryUsername = req.body.username;
        var password = req.body.password;
        var ArtifactoryUser = getArtifactoryUser();
        ArtifactoryUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Artifactory user: ' + err.message);
                return;
            }
            if (data == null) {
                var newUser = new ArtifactoryUser({
                    bitBucketUsername: bitBucketUsername,
                    url: url,
                    artifactoryUsername: artifactoryUsername,
                    password: password
                });
                newUser.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Artifactory user:' + err.message);
                    } else {
                        console.log('Artifactory: CREATING NEW ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + artifactoryUsername);
                    }
                });
            } else {
                data.url = url;
                data.artifactoryUsername = artifactoryUsername;
                data.password = password;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Artifactory user:' + err.message);
                    } else {
                        console.log('Artifactory: UPDATING EXISTING ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + artifactoryUsername);
                    }
                });
            }
        });
        res.render('artifactory-user', {username: artifactoryUsername, password: password, url: url});
        }
    );
    app.get('/artifactory-user', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var ArtifactoryUser = getArtifactoryUser();
        ArtifactoryUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Artifactory user: ' + err.message);
                return;
            }
            if (data == null) {
                res.render('artifactory-user', {bitBucketUsername: bitBucketUsername, url: null, username: null, password: null});
            } else {
                res.render('artifactory-user', {
                    bitBucketUsername: bitBucketUsername,
                    url: data.url,
                    username: data.artifactoryUsername,
                    password: data.password
                })
            }
        });
    });

    app.post('/bamboo-user', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
            var bitBucketUsername = req.bitBucketUsername;
            var url = req.body.url;
            var bambooUsername = req.body.username;
            var password = req.body.password;
            var BambooUser = getBambooUser();
            BambooUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
                    return;
                }
                if (data == null) {
                    var newUser = new BambooUser({
                        bitBucketUsername: bitBucketUsername,
                        url: url,
                        bambooUsername: bambooUsername,
                        password: password
                    });
                    newUser.save(function (err) {
                        if (err) {
                            res.send('Error occurred while creating a new associated Bamboo user:' + err.message);
                        } else {
                            console.log('Bamboo: CREATING NEW ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bambooUsername);
                        }
                    });
                } else {
                    data.url = url;
                    data.bambooUsername = bambooUsername;
                    data.password = password;
                    data.save(function (err) {
                        if (err) {
                            res.send('Error occurred while updating associated Bamboo user:' + err.message);
                        } else {
                            console.log('Bamboo: UPDATING EXISTING ASSOCIATION OF ' + bitBucketUsername + ' WITH ' + bambooUsername);
                        }
                    });
                }
            });
            res.render('bamboo-user', {username: bambooUsername, password: password, url: url});
        }
    );

    app.get('/bamboo-user', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;

        var BambooUser = getBambooUser();
        BambooUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
                return;
            }
            if (data == null) {
                res.render('bamboo-user', {url: null, username: null, password: null});
            } else {
                res.render('bamboo-user', {url: data.url, username: data.bambooUsername, password: data.password})
            }
        });
    });

    app.get('/associate-package', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
            var repoUuid = req.query['repoUuid'];
            console.log('FOUND UUID' + repoUuid);
            var BintrayPackage = getBintrayPackage();
            BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                if (err) {
                    res.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                    return;
                }
                if (data == null) {
                    res.render('associate-package', {repoUuid: repoUuid, packagePath: null});
                } else {
                    res.render('associate-package', {repoUuid: repoUuid, packagePath: data.bintrayPackage})
                }
            });
        }
    );

    app.post('/associate-package', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
        var repoUuid = req.body.repoUuid;
        var packagePath = req.body.packagePath;

        var BintrayPackage = getBintrayPackage();
        BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                return;
            }
            if (data == null) {
                var newPackage = new BintrayPackage({
                    bitBucketRepoUuid: repoUuid,
                    bintrayPackage: packagePath
                });
                newPackage.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Bintray package:' + err.message);
                    } else {
                        console.log('BINTRAY: CREATING NEW ASSOCIATION OF ' + repoUuid + ' WITH ' + packagePath);
                    }
                });
            } else {
                data.bintrayPackage = packagePath;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Bintray package:' + err.message);
                    } else {
                        console.log('BINTRAY: UPDATING EXISTING ASSOCIATION OF ' + repoUuid + ' WITH ' + packagePath);
                    }
                });
            }
        });
        res.render('associate-package', {repoUuid: repoUuid, packagePath: packagePath});
    });

    app.get('/associate-bamboo-build', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var repoUuid = req.query['repoUuid'];
        var builds = [];
        console.log('FOUND UUID' + repoUuid);
        bambooRequestOptions('result', bitBucketUsername, function (options) {
            if (options != null) {
                var protocol = options.nameProtocol === "http" ? http : https;
                var reqGet = protocol.get(options, function (resGet) {
                    console.log('STATUS: ' + resGet.statusCode);
                    resGet.setEncoding('utf8');
                    var rawData = [];
                    resGet.on('data', function (chunk) {
                        rawData.push(chunk);
                    });
                    resGet.on('end', function (resGet) {
                        var chunk = rawData.join('');
                        reqGet.write(chunk);
                        parseString(chunk, function (err, result) {
                            var build_object_list = result.results.results["0"];
                            build_list = JSON.parse(JSON.stringify(build_object_list.result));
                            for (var key in build_list) {
                                var build = build_list[key];
                                builds.push({"buildKey": build.plan[0].$.key, "buildName": build.plan[0].$.name});
                            }
                            var BambooBuild = getBambooBuild();
                            BambooBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                                if (err) {
                                    res.send('Error occurred while querying for an already existing associated Bamboo Build: ' + err.message);
                                    return;
                                }
                                if (data == null) {
                                    res.render('associate-bamboo-build', {repoUuid: repoUuid, builds: builds});

                                } else {
                                    var selected = [{
                                        "buildName": data.bambooBuildName,
                                        "buildKey": data.bambooBuildKey
                                    }];
                                    res.render('associate-bamboo-build', {repoUuid: repoUuid, builds: builds, selected: selected});
                                }
                            });
                        });
                    });
                });
                reqGet.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });
                reqGet.end();
            } else {
                var message = 'configured Bamboo user not found! ';
                res.render('error', {message: message});
            }
        });

    });

    app.post('/associate-bamboo-build', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var repoUuid = req.body.repoUuid;
        var bambooBuildName = req.body["select-build"];
        var bambooBuildKey = bambooBuildName.split(":")[1];
        var BambooBuild = getBambooBuild();
        BambooBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bamboo Build: ' + err.message);
                return;
            }
            if (data == null) {
                var newBambooBuild = new BambooBuild({
                    bitBucketRepoUuid: repoUuid,
                    bambooBuildName: bambooBuildName,
                    bambooBuildKey: bambooBuildKey
                });
                newBambooBuild.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Bamboo Build:' + err.message);
                    } else {
                        console.log('BAMBOO: CREATING NEW ASSOCIATION OF ' + repoUuid + ' WITH ' + bambooBuildName);
                    }
                });
            } else {
                data.bambooBuildName = bambooBuildName;
                data.bambooBuildKey = bambooBuildKey;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Bamboo Build:' + err.message);
                    } else {
                        console.log('BAMBOO: UPDATING EXISTING ASSOCIATION OF ' + repoUuid + ' WITH ' + bambooBuildName);
                    }
                });
            }
        });
        var selected = [{"buildName": bambooBuildName, "buildKey": null}];
        res.render('associate-bamboo-build', {repoUuid: repoUuid, selected: selected});
    });
    app.get('/associate-artifactory-build', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var repoUuid = req.query['repoUuid'];
        var builds;
        console.log('FOUND UUID' + repoUuid);
        artifactoryRequestOptions('build', bitBucketUsername, function (options) {
            if (options != null) {
                var protocol = options.nameProtocol === "https" ? https : http;

                var reqGet = protocol.request(options, function (resGet) {
                    console.log('STATUS: ' + resGet.statusCode);
                    resGet.setEncoding('utf8');
                    var rawData = [];
                    resGet.on('data', function (chunk) {
                        rawData.push(chunk);
                    });
                    resGet.on('end', function (resGet) {
                        var chunk = rawData.join('');
                        reqGet.write(chunk);
                        if (chunk.indexOf("<") > -1) {
                            var list = " ";
                        } else {
                            var list = JSON.parse(chunk);
                        }
                        builds = list["builds"];
                        var ArtifactoryBuild = getArtifactoryBuild();
                        ArtifactoryBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                            if (err) {
                                res.send('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
                                return;
                            }
                            if (data == null) {
                                res.render('associate-artifactory-build', {repoUuid: repoUuid, builds: builds})
                            } else {
                                var selected = [{'uri': data.artifactoryBuild}];
                                res.render('associate-artifactory-build', {repoUuid: repoUuid, builds: builds, selected: selected})
                            }
                        });
                    });
                });
                reqGet.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });
                reqGet.end();
            } else {
                var message = 'configured Artifactory user not found! ';
                res.render('error', {message: message});
            }
        });
    });

    app.post('/associate-artifactory-build', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var repoUuid = req.body.repoUuid;
        var artifactoryBuild = req.body["select-build"];
        var ArtifactoryBuild = getArtifactoryBuild();
        ArtifactoryBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
                return;
            }
            if (data == null) {
                var newArtifactoryBuild = new ArtifactoryBuild({
                    bitBucketRepoUuid: repoUuid,
                    artifactoryBuild: artifactoryBuild
                });
                newArtifactoryBuild.save(function (err) {
                    if (err) {
                        res.send('Error occurred while creating a new associated Artifactory Build:' + err.message);
                    } else {
                        console.log('ARTIFACTORY: CREATING NEW ASSOCIATION OF ' + repoUuid + ' WITH ' + artifactoryBuild);
                    }
                });
            } else {
                data.artifactoryBuild = artifactoryBuild;
                data.save(function (err) {
                    if (err) {
                        res.send('Error occurred while updating associated Artifactory Build:' + err.message);
                    } else {
                        console.log('ARTIFACTORY: UPDATING EXISTING ASSOCIATION OF ' + repoUuid + ' WITH ' + artifactoryBuild);
                    }
                });
            }
        });
        var selected = [{'uri': artifactoryBuild}];
        res.render('associate-artifactory-build', {repoUuid: repoUuid, selected: selected});
    });

    app.get('/triggerBuild/:planKey', addon.checkValidToken(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var planKey = req.params.planKey;
        var post_data = '?stage&ExecuteAllStages';
        bambooRequestOptions('queue/' + planKey, bitBucketUsername, function (options) {
            options.headers = {'Content-Length': Buffer.byteLength(post_data)};
            options.method = 'POST';
            var protocol = options.nameProtocol === "http" ? http : https;
            var post_req = protocol.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log(chunk);

                });
            });
            // post the data
            post_req.write(post_data);
            post_req.end();

        });
        res.redirect(req.get('referer'));
    });
    app.post('/triggerBuild', addon.authenticate(), function (req, res) {
        console.log("triggering bamboo build");
    });

    app.get('/testArtifactoryConnection', function (reqQ, resQ) {
        var username = reqQ.query.username;
        var password = reqQ.query.password;
        var Artifactory_url = reqQ.query.url;
        var host_url = url.parse(Artifactory_url);
        var port;
        console.log("%j", host_url);
        if (host_url.protocol === "http:") {
            port = 80;
        } else {
            port = 443;
        }
        var options = {
            host: host_url.hostname,
            port: host_url.port || port,
            path: host_url.pathname + '/api/system/ping',
            method: 'GET',
            nameProtocol: host_url.protocol.split(':')[0],
            headers: {
                'Content-Type': 'application/json'
            },
            auth: username + ':' + password
        };
        console.log("%j", options);
        if (options != null) {
            var protocol = options.nameProtocol === "https" ? https : http;
            reqQ = protocol.request(options, function (res) {
                var statusCode = res.statusCode
                console.log(statusCode);
                resQ.send("Connection " + statusCode);
            });
            reqQ.setTimeout(10000, function () {
                reqQ.abort();
                resQ.send("Connection timeout");
            })
            reqQ.end();

            reqQ.on('error', function (e) {
                console.error(e);
                if (!resQ.headersSent) {
                    resQ.send(e.message)
                }
            });
        }
    });

    app.get('/testBambooConnection', function (reqQ, resQ) {
        var username = reqQ.query.username;
        var password = reqQ.query.password;
        var bamboo_url = reqQ.query.url;
        var host_url = url.parse(bamboo_url);
        var port;
        if (host_url.protocol === "http:") {
            port = 80;
        } else {
            port = 443;
        }
        var options = {
            host: host_url.hostname,
            port: host_url.port || port,
            path: host_url.pathname + 'rest/api/latest/',
            method: 'GET',
            nameProtocol: host_url.protocol.split(':')[0],
            headers: {
                'Content-Type': 'application/json'
            },
            auth: username + ':' + password
        };
        if (options != null) {
            var protocol = options.nameProtocol === "https" ? https : http;
            reqQ = protocol.request(options, function (res) {
                var statusCode = res.statusCode
                console.log(statusCode);
                resQ.send("Connection " + statusCode);
            });
            reqQ.setTimeout(10000, function () {
                reqQ.abort();
                resQ.send("Connection timeout");
            })
            reqQ.end();
            reqQ.on('error', function (e) {
                console.error(e);
                if (!resQ.headersSent) {
                  resQ.send(e.message)
                }
            });
        }


    });

    app.get('/downloadArchive/:buildName/:buildNumber', addon.checkValidToken(), fetchCurrentUsername(), function (originalRequest, originalResponse) {
        var bitBucketUsername = originalRequest.bitBucketUsername;
        var buildName = originalRequest.params.buildName;
        var buildNumber = originalRequest.params.buildNumber;
        var file_name = buildName + "_" + buildNumber + ".tar.gz";
        var file = fs.createWriteStream(file_name);
        var post_data = '{"buildName":"' + buildName + '","buildNumber":"' + buildNumber + '","archiveType":"tar.gz"}';
        var body = '';
        artifactoryRequestOptions('archive/buildArtifacts', bitBucketUsername, function (options) {
            options.headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/zip',
                'Content-Length': Buffer.byteLength(post_data)
            };
            options.method = 'POST';
            var protocol = options.nameProtocol === "http" ? http : https;
            var post_req = protocol.request(options, function (res) {
                res.on('data', function (chunk) {
                    //console.log(chunk);
                    // body += chunk;
                    file.write(chunk);

                });
                res.on('end', function (res) {
                    // file.write(body);
                    file.close();
                    originalResponse.download(file.path);
                });
            });
            post_req.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            // post the data
            post_req.write(post_data);
            post_req.end();
        });


    });

    app.get('/jfrog', addon.authenticate(), fetchCurrentUsername(), function (req, res) {
        var bitBucketUsername = req.bitBucketUsername;
        var repoUuid = req.query['repoUuid'];
        var BambooBuild = getBambooBuild();
        var buildInfo = [];
        BambooBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
            if (err) {
                res.send('Error occurred while querying for an already existing associated Bamboo Build ' + err.message);
            }
            if (data == null) {
                var message = 'Bamboo build is not selected. Please Select Bamboo build';
                res.render('error', {message: message});
            } else {
                bambooRequestOptions('result/' + data.bambooBuildKey, bitBucketUsername, function (options) {
                    if (options != null) {
                        var protocol = options.nameProtocol === "http" ? http : https;
                        var reqBambooGet = protocol.request(options, function (resBambooGet) {
                            console.log('STATUS: ' + resBambooGet.statusCode);
                            resBambooGet.setEncoding('utf8');
                            var rawData = [];
                            resBambooGet.on('data', function (chunk) {
                                rawData.push(chunk);
                            });
                            resBambooGet.on('end', function (resBambooGet) {
                                var chunk = rawData.join('');
                                reqBambooGet.write(chunk);
                                parseString(chunk, function (err, result) {
                                    buildInfo = result.results.results[0].result;
                                    var ArtifactoryBuild = getArtifactoryBuild();
                                    ArtifactoryBuild.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                                        if (err) {
                                            res.send('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
                                            return;
                                        }
                                        if (data == null) {
                                            console.log("Artifactory Build is not selected");
                                            res.render('jfrog', {
                                                bambooBuildInfo: buildInfo
                                            });
                                        } else {
                                            var list_object = [];
                                            for (var key in buildInfo) {
                                                (function (key) {
                                                    list_object.push(key);
                                                    var number = buildInfo[key].buildNumber[0];
                                                    buildInfo[key].bitBucketUsername = bitBucketUsername;
                                                    buildInfo[key].buildLink = buildInfo[key].link["0"].$.href.replace("rest/api/latest/result", "browse");
                                                    artifactoryRequestOptions('build' + data.artifactoryBuild + "/" + number, bitBucketUsername, function (artifactoryOptions) {
                                                        if (artifactoryOptions != null) {
                                                            var artiProtocol = artifactoryOptions.nameProtocol === "http" ? http : https;
                                                            var reqGet = artiProtocol.request(artifactoryOptions, function (resGet) {
                                                                console.log('STATUS: ' + resGet.statusCode);
                                                                resGet.setEncoding('utf8');
                                                                var rawDataArti = [];
                                                                resGet.on('data', function (chunk) {
                                                                    rawDataArti.push(chunk);
                                                                });
                                                                resGet.on('end', function (resGet) {
                                                                    var chunkArti = rawDataArti.join('');
                                                                    reqGet.write(chunkArti);
                                                                    if (chunkArti.indexOf("<") > -1) {
                                                                        var artBuildInfo = " ";
                                                                    } else {
                                                                        var artBuildInfo = JSON.parse(chunkArti);
                                                                    }
                                                                    if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.name != undefined) {
                                                                        buildInfo[key].artName = artBuildInfo.buildInfo.name;
                                                                    } else {
                                                                        buildInfo[key].artName = " ";
                                                                    }
                                                                    if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.principal != undefined) {
                                                                        buildInfo[key].principal = artBuildInfo.buildInfo.principal;
                                                                    } else {
                                                                        buildInfo[key].principal = " ";
                                                                    }
                                                                    if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.buildAgent != undefined) {
                                                                        buildInfo[key].buildAgent = artBuildInfo.buildInfo.buildAgent;
                                                                    } else {
                                                                        buildInfo[key].buildAgent = " ";
                                                                    }
                                                                    if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.number != undefined) {
                                                                        buildInfo[key].artBuildNumber = artBuildInfo.buildInfo.number;
                                                                    } else {
                                                                        buildInfo[key].artBuildNumber = " ";
                                                                    }
                                                                    if (artBuildInfo.uri != undefined && artBuildInfo.uri != undefined) {
                                                                        buildInfo[key].uri = artBuildInfo.uri.replace("api/build", "webapp/#/builds");
                                                                    } else {
                                                                        buildInfo[key].uri = " ";
                                                                    }
                                                                    if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.started != undefined) {
                                                                        buildInfo[key].promotionTime = artBuildInfo.buildInfo.started;
                                                                    } else {
                                                                        buildInfo[key].promotionTime = " ";
                                                                    }
                                                                    if (artBuildInfo.buildInfo != undefined && artBuildInfo.buildInfo.statuses != undefined) {
                                                                        buildInfo[key].statuses = artBuildInfo.buildInfo.statuses;
                                                                    } else {
                                                                        buildInfo[key].statuses = [];
                                                                    }
                                                                    var BintrayPackage = getBintrayPackage();
                                                                    BintrayPackage.findOne({where: {bitBucketRepoUuid: repoUuid}}, function (err, data) {
                                                                        if (err) {
                                                                            res.send('Error occurred while querying for an already existing associated Bintray package: ' + err.message);
                                                                            return;
                                                                        }
                                                                        if ((data == null) || (data.bintrayPackage == null)) {
                                                                            console.log("Package not found!");
                                                                            list_object.splice(list_object.indexOf(key), 1);
                                                                            if (list_object.length == 0) {
                                                                                res.render('jfrog', {
                                                                                    bambooBuildInfo: buildInfo
                                                                                });
                                                                            }
                                                                        } else {
                                                                            var post_data = '[{"build.number":["' + buildInfo[key].artBuildNumber + '"]},{"build.name":["' + buildInfo[key].artName + '"]}]';
                                                                            var path = 'search/attributes/' + data.bintrayPackage + '/versions';
                                                                            bintrayRequestOptionsPost(path, bitBucketUsername, post_data, function (options) {
                                                                                if (options != null) {
                                                                                    var post_req = https.request(options, function (resPost) {
                                                                                        resPost.setEncoding('utf8');
                                                                                        var output = [];
                                                                                        resPost.on('data', function (chunk) {
                                                                                            output.push(chunk);
                                                                                        });
                                                                                        resPost.on('end', function (resPost) {
                                                                                            var chunk = output.join('');
                                                                                            if (chunk != "[]" && chunk != "") {
                                                                                                var vesion = JSON.parse(chunk);
                                                                                                buildInfo[key].version = vesion[0].name;
                                                                                                buildInfo[key].repo = vesion[0].repo;
                                                                                                buildInfo[key].package = vesion[0].package;
                                                                                                buildInfo[key].owner = vesion[0].owner;
                                                                                            } else {
                                                                                                buildInfo[key].version = " ";
                                                                                                buildInfo[key].repo = " ";
                                                                                                buildInfo[key].package = " ";
                                                                                                buildInfo[key].owner = " ";
                                                                                            }
                                                                                            list_object.splice(list_object.indexOf(key), 1);
                                                                                            if (list_object.length == 0) {
                                                                                                res.render('jfrog', {
                                                                                                    bambooBuildInfo: buildInfo
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    });
                                                                                    post_req.write(post_data);
                                                                                    post_req.on('error', function (err) {
                                                                                        console.log('error: ' + err.message);
                                                                                    });
                                                                                    post_req.end();
                                                                                }
                                                                                else {
                                                                                    list_object.splice(list_object.indexOf(key), 1);
                                                                                    if (list_object.length == 0) {
                                                                                        res.render('jfrog', {
                                                                                            bambooBuildInfo: buildInfo
                                                                                        });
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                            reqGet.on('error', function (e) {
                                                                console.log('problem with request: ' + e.message);
                                                            });
                                                            reqGet.end();
                                                        } else {
                                                            var message = 'configured Artifactory user not found!';
                                                            list_object.splice(list_object.indexOf(key), 1);
                                                            if (list_object.length == 0) {
                                                                res.render('jfrog', {
                                                                    bambooBuildInfo: buildInfo
                                                                });
                                                            }
                                                        }
                                                    });
                                                })(key);
                                            }
                                        }
                                    });
                                });
                            });
                        });
                        reqBambooGet.on('error', function (e) {
                            console.log('problem with request: ' + e.message);
                        });
                        reqBambooGet.end();
                    } else {
                        var message = 'configured Bamboo user not found! ';
                        res.render('error', {message: message});
                    }
                });


            }
        });
    });

    app.post('/jfrog', addon.checkValidToken(), function (req, res) {

    });

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

    function bintrayRequestOptions(packagePath) {
        var options = {
            host: 'api.bintray.com',
            port: 443,
            path: '/packages/' + packagePath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return options;
    }


    var bintrayRequestOptionsPost = function (path, bitBucketUsername, post_data, callback) {
        var options;
        var BintrayUser = getBintrayUser();
        BintrayUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                console.log('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
            }
            if (data != null && data.bintrayUsername != null && data.bintrayUsername != "" && data.apiKey != null && data.apiKey != "") {
                options = {
                    host: 'api.bintray.com',
                    port: 443,
                    path: '/' + path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(post_data)
                    }, auth: data.bintrayUsername + ':' + data.apiKey
                };
            } else {
                console.log("Bintray User not found");
            }
            callback(options);
        });
    };

    var bambooRequestOptions = function (path, bitBucketUsername, callback) {
        var options;
        var port;
        var BambooUser = getBambooUser();
        BambooUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                console.log('Error occurred while querying for an already existing associated Bamboo user: ' + err.message);
            }
            if (data != null && data.url != null && data.url != "" && data.bambooUsername != null && data.bambooUsername != "" && data.password != null && data.password != "") {
                var host_url = url.parse(data.url);
                if (host_url.protocol === "http:") {
                    port = 80;
                } else {
                    port = 443;
                }
                options = {
                    host: host_url.hostname,
                    port: host_url.port || port,
                    path: '/rest/api/latest/' + path,
                    method: 'GET',
                    nameProtocol: host_url.protocol.split(':')[0],
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: data.bambooUsername + ':' + data.password
                };
            } else {
                console.log("Bamboo user not found!");
            }
            callback(options);
        });
    };

    var artifactoryRequestOptions = function (path, bitBucketUsername, callback) {
        var options;
        var port;
        var ArtifactoryUser = getArtifactoryUser();
        ArtifactoryUser.findOne({where: {bitBucketUsername: bitBucketUsername}}, function (err, data) {
            if (err) {
                console.log('Error occurred while querying for an already existing associated Artifactory Build: ' + err.message);
            }
            if (data != null && data.url != null && data.url != "" && data.artifactoryUsername != null && data.artifactoryUsername != "" && data.password != null && data.password != "") {
                var host_url = url.parse(data.url);
                if (host_url.protocol === "http:") {
                    port = 80;
                } else {
                    port = 443;
                }
                options = {
                    host: host_url.hostname,
                    port: host_url.port || port,
                    path: host_url.pathname + '/api/' + path,
                    method: 'GET',
                    nameProtocol: host_url.protocol.split(':')[0],
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: data.artifactoryUsername + ':' + data.password
                };
            } else {
                console.log("Artifactory User not found");
            }
            callback(options);
        });
    };

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

    function getCurrentUsername(req, res, cb) {
      addon.loadClientInfo(req.context.clientKey)
        .then(function (clientInfo) {
            if (clientInfo == null) {
              throw new Error('Current Username not found!')
            }
            cb(clientInfo.principal.username);
        })
        .then(undefined, function (error) {
            res.send('Failed to authenticate request: ' + error.message);
        });
    }

    function fetchCurrentUsername() {
      return function (req, res, next) {
        getCurrentUsername(req, res, function(currentUsername) {
            req.bitBucketUsername = currentUsername
            next()
        })
      };
    }
};
