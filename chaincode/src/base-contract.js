const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class BaseContract extends Contract {
  constructor(namespace) {
    super(namespace);
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
}

module.exports = BaseContract;
