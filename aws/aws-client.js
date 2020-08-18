var constants = require('../constants');
var AWS = require('aws-sdk'),
    region = constants.aws_region,
    secretName = constants.aws_secret_name,
    secret,
    decodedBinarySecret;

const secretsManager = new AWS.SecretsManager({
    region: region
});

module.exports = secretsManager;