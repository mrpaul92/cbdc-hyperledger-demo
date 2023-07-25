const grpc = require("@grpc/grpc-js");
const { connect, signers } = require("@hyperledger/fabric-gateway");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const config = require("./config");

class Connection {
  constructor(org) {
    const tlsRootCert = fs.readFileSync(config.tlsCertPath[org]);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    this.client = new grpc.Client(config.peerEndpoint[org], tlsCredentials, {
      "grpc.ssl_target_name_override": config.peerHostAlias[org],
    });

    const credentials = fs.readFileSync(config.certPath[org]);
    const identity = { mspId: config.mspId[org], credentials };

    const files = fs.readdirSync(config.keyDirectoryPath[org]);
    const keyPath = path.resolve(config.keyDirectoryPath[org], files[0]);
    const privateKeyPem = fs.readFileSync(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    const client = this.client;
    this.gateway = connect({
      client,
      identity,
      signer,
      // Default timeouts for different gRPC calls
      evaluateOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
      },
      endorseOptions: () => {
        return { deadline: Date.now() + 15000 }; // 15 seconds
      },
      submitOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
      },
      commitStatusOptions: () => {
        return { deadline: Date.now() + 60000 }; // 1 minute
      },
    });

    const network = this.gateway.getNetwork(config.channelName);
    this.contract = network.getContract(config.chaincodeName);
  }

  getContract() {
    return this.contract;
  }

  close() {
    this.gateway.close();
    this.client.close();
  }
}

module.exports = { Connection };
