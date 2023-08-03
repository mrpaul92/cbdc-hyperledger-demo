const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class BaseContract extends Contract {
  #token;
  #counter;
  constructor(namespace) {
    super(namespace);
    this.#token = 1;
    this.#counter = 1;
  }

  _require(value, name) {
    if (!value) {
      throw new Error(`Parameter ${name} is missing`);
    }
  }

  _createCompositeKey(stub, key, value) {
    return stub.createCompositeKey(key, [value]);
  }

  async _checkExists(stub, compositeKey) {
    const buffer = await stub.getState(compositeKey);
    return !!buffer && buffer.length > 0;
  }

  async _addData(stub, compositeKey, data) {
    const exists = await this._checkExists(stub, compositeKey);
    if (exists) {
      throw new Error(`The data in key: ${compositeKey} already exists`);
    }
    const buffer = Buffer.from(stringify(sortKeysRecursive(data)));
    await stub.putState(compositeKey, buffer);
  }

  async _getData(stub, compositeKey) {
    const exists = await this._checkExists(stub, compositeKey);
    if (!exists) {
      throw new Error(`The data in key: ${compositeKey} does not exist`);
    }
    const dataJSON = await stub.getState(compositeKey);
    return dataJSON.toString();
  }

  async _deleteData(stub, compositeKey) {
    const exists = await this._checkExists(stub, compositeKey);
    if (!exists) {
      throw new Error(`The data in key: ${compositeKey} does not exist`);
    }
    await stub.deleteState(compositeKey);
  }

  async _updateData(stub, compositeKey, newData) {
    const exists = await this._checkExists(stub, compositeKey);
    if (!exists) {
      throw new Error(`The data in key: ${compositeKey} does not exist`);
    }
    const buffer = Buffer.from(stringify(sortKeysRecursive(newData)));
    await stub.putState(compositeKey, buffer);
  }

  async _getHistoryForKey(stub, compositeKey) {
    const exists = await this._checkExists(stub, compositeKey);
    if (!exists) {
      throw new Error(`The data in key: ${compositeKey} does not exist`);
    }

    const historyIterator = await stub.getHistoryForKey(compositeKey);
    const history = [];
    while (true) {
      const historyRecord = await historyIterator.next();

      if (historyRecord.done) {
        await historyIterator.close();
        return JSON.stringify(history);
      }

      const txId = historyRecord.value.txId;
      const timestamp = historyRecord.value.timestamp;
      const value = JSON.parse(historyRecord.value.value.toString("utf8"));

      history.push({ txId, timestamp, value });
    }
  }

  _generateUniqueString(stub) {
    const txId = stub.getTxID();
    const timestamp = stub.getTxTimestamp();
    const timestampAsDate = new Date(
      timestamp.seconds * 1000 + timestamp.nanos / 1000000
    );
    const uniqueString =
      txId +
      timestampAsDate.getTime().toString() +
      (this.#counter++).toString();
    const hash = crypto.createHash("sha256");
    hash.update(uniqueString);
    return hash.digest("hex");
  }

  _getTokenId() {
    return (this.#token++).toString();
  }
}

module.exports = BaseContract;
