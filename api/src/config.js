const path = require("path");

const channelName = process.env.CHANNEL_NAME || "mychannel";
const chaincodeName = process.env.CHAINCODE_NAME || "basic";
const mspId = {
  org1: "Org1MSP",
  org2: "Org2MSP",
};

// Path to crypto materials.
const cryptoPath = {
  org1: path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "test-network",
    "organizations",
    "peerOrganizations",
    "org1.example.com"
  ),
  org2: path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "test-network",
    "organizations",
    "peerOrganizations",
    "org2.example.com"
  ),
};

// Path to user private key directory.
const keyDirectoryPath = {
  org1: path.resolve(
    cryptoPath.org1,
    "users",
    "User1@org1.example.com",
    "msp",
    "keystore"
  ),
  org2: path.resolve(
    cryptoPath.org2,
    "users",
    "User1@org2.example.com",
    "msp",
    "keystore"
  ),
};

// Path to user certificate.
const certPath = {
  org1: path.resolve(
    cryptoPath.org1,
    "users",
    "User1@org1.example.com",
    "msp",
    "signcerts",
    "cert.pem"
  ),
  org2: path.resolve(
    cryptoPath.org2,
    "users",
    "User1@org2.example.com",
    "msp",
    "signcerts",
    "cert.pem"
  ),
};

// Path to peer tls certificate.
const tlsCertPath = {
  org1: path.resolve(
    cryptoPath.org1,
    "peers",
    "peer0.org1.example.com",
    "tls",
    "ca.crt"
  ),
  org2: path.resolve(
    cryptoPath.org2,
    "peers",
    "peer0.org2.example.com",
    "tls",
    "ca.crt"
  ),
};

// Gateway peer endpoint.
const peerEndpoint = {
  org1: "localhost:7051",
  org2: "localhost:9051",
};

// Gateway peer SSL host name override.
const peerHostAlias = {
  org1: "peer0.org1.example.com",
  org2: "peer0.org2.example.com",
};

const utf8Decoder = new TextDecoder();

const config = {
  channelName,
  chaincodeName,
  mspId,
  certPath,
  cryptoPath,
  keyDirectoryPath,
  tlsCertPath,
  peerEndpoint,
  peerHostAlias,
  utf8Decoder,
};

module.exports = config;
