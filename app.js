/**
 * Created by noam on 11/24/15.
 */

// web framework that `atlassian-connect-express` uses
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var urlParse = require('url-parse');

var ac = require('atlassian-connect-express');

// Static expiry middleware to help serve static resources efficiently
process.env.PWD = process.env.PWD || process.cwd(); // Fix expiry on Windows :(
var expiry = require('static-expiry');

var hbs = require('express-hbs');
var http = require('http');
var path = require('path');
var os = require('os');

var staticDir = path.join(__dirname, 'public');

var viewsDir = __dirname + '/views';

var routes = require('./routes');

var app = express();

var addon = ac(app, {
  config: {
    descriptorTransformer: (descriptor, config) => {
      descriptor.modules.oauthConsumer.clientId = config.consumerKey();
      return descriptor;
    }
  }
});

var port = addon.config.port();

var devEnv = app.get('env') == 'development';

// The following settings applies to all environments
app.set('port', port);

// Configure the Handlebars view engine
app.engine('hbs', hbs.express3({partialsDir: viewsDir}));
app.set('view engine', 'hbs');
app.set('views', viewsDir);

app.use(morgan(devEnv ? 'dev' : 'default'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(compression());
// app.use(express.favicon());
app.use(addon.middleware());
app.use(expiry(app, {dir: staticDir, debug: devEnv}));
hbs.registerHelper('furl', function (url) {
    return app.locals.furl(url);
});

hbs.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

// app.use(app.router);
app.use(express.static(staticDir));
if (devEnv) app.use(errorHandler());

// Wire up your routes using the express and `atlassian-connect-express` objects
routes(app, addon);

var Schema = require('jugglingdb').Schema;
var postgres = addon.config.store().url;
var url = urlParse(postgres);

var schema = new Schema('postgres', {
    database: url.pathname.replace('/',''),
    username: url.username,
    host: url.hostname,
    password: url.password
});


global.getSchema = function () {
    return schema;
};

var BintrayUser = schema.define('BintrayUser', {
    bitBucketUsername: String,
    bintrayUsername: String,
    apiKey: String
});

var ArtifactoryUser = schema.define('ArtifactoryUser', {
    bitBucketUsername: String,
    url: String,
    artifactoryUsername: String,
    password: String
});
var BambooUser = schema.define('BambooUser', {
    bitBucketUsername: String,
    url: String,
    bambooUsername: String,
    password: String
});

var BintrayPackage = schema.define('BintrayPackage', {
    bitBucketRepoUuid: String,
    bintrayPackage: String
});

var BambooBuild = schema.define('BambooBuild', {
    bitBucketRepoUuid: String,
    bambooBuildName: String,
    bambooBuildKey: String
});

var ArtifactoryBuild = schema.define('ArtifactoryBuild', {
    bitBucketRepoUuid: String,
    artifactoryBuild: String
});

schema.autoupdate();

global.getBintrayUser = function () {
    return BintrayUser;
};

global.getArtifactoryUser = function () {
    return ArtifactoryUser;
};

global.getBambooUser = function () {
    return BambooUser;
};

global.getBintrayPackage = function () {
    return BintrayPackage;
};

global.getBambooBuild = function () {
    return BambooBuild;
};

global.getArtifactoryBuild = function () {
    return ArtifactoryBuild;
};

// Boot
http.createServer(app).listen(port, function () {
    console.log('Add-on server running at http://' + os.hostname() + ':' + port);
//    // Enables auto registration/de-registration of add-ons into a host in dev mode
//    if (devEnv) addon.register();
});
