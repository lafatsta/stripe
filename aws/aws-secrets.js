const secretsManager = require('./aws-client');
module.exports.handler = async (event, context) => {
    try {
        const data = await secretsManager.getSecretValue({
            SecretId: 'StripeSK',
        }).promise();

        if (data) {
            /*We have used AWS Secrets Manager to obtain the Stripe Private Key and MongoDB connection string*/

            if (data.SecretString) {
                const secret = data.SecretString;
                const parsedSecret = JSON.parse(secret);
                return {
                    secrets: parsedSecret,
                };
            }

            /*We should not be entering here since no secrets of this type have been setup, yet for completeness*/
            const binarySecretData = data.SecretBinary;
            return binarySecretData;
        }
    } catch (err) {
        var explaination = "Unknown";
        if (err.code === 'DecryptionFailureException')
            explaination = "Secrets Manager can't decrypt the protected secret text using the provided KMS key.";
        else if (err.code === 'InternalServiceErrorException')
            explaination = "An error occured on the server side";
        else if (err.code === 'InvalidParameterException')
            explaination = "You provided an invalid value for a parameter";
        else if (err.code === 'InvalidRequestException')
            explaination = "You provided a parameter value that is not valid for the current state of the resource.";
        else if (err.code === 'ResourceNotFoundException')
            explaination = "We can't find the resource that you asked for.";
        else if (err.code === 'ConfigError')
            explaination = "Configuration Issue";

        console.log("Error Retriving Secrets from AWS Secrets Manager: " + err.code);
        console.log("Explaination: " + explaination);
    }
};

