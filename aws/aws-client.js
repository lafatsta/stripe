/*
var constants = require('../constants')
const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager')

const secretsManager = new SecretsManagerClient({
  region: constants.aws_region
})

async function getSecret () {
  const command = new GetSecretValueCommand({
    SecretId: 'BDR01'
  })

  const response = await secretsManager.send(command)

  if (!response.SecretString) {
    throw new Error('SecretString is empty')
  }

  return JSON.parse(response.SecretString)
}*/
