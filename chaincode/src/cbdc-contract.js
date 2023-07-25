const BaseContract = require("./base-contract");
const { nanoid } = require("nanoid");

class CbdcContract extends BaseContract {
  #initialized;
  #prefixDenominations;
  #prefixNotes;
  #initialOwner;
  constructor() {
    super("cbdc");
    this.#prefixDenominations = "denominations_";
    this.#prefixNotes = "notes_";
    this.#initialized = false;
    this.#initialOwner = "RBI";
  }

  async initLedger(ctx) {
    if (!this.#initialized) {
      // insert current denominations
      const denominations = [
        {
          id: 1,
          value: 10,
          isActive: true,
        },
        {
          id: 2,
          value: 20,
          isActive: true,
        },
        {
          id: 3,
          value: 50,
          isActive: true,
        },
        {
          id: 4,
          value: 100,
          isActive: true,
        },
        {
          id: 5,
          value: 500,
          isActive: true,
        },
      ];

      for (let denomination of denominations) {
        const compositeKey = this._createCompositeKey(
          ctx.stub,
          this.#prefixDenominations,
          denomination.id.toString()
        );
        await this._addData(ctx.stub, compositeKey, denomination);
      }
      console.log("Ledger initialized");
      this.#initialized = true;
    } else {
      console.log("Error: Ledger already initialized");
    }
  }

  async getDenominations(ctx) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByPartialCompositeKey(
      this.#prefixDenominations,
      []
    );
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  async createNotes(ctx, denominationId, denominationValue, noOfNotes) {
    const prefix = this.#prefixNotes + denominationId;

    for (let i = 0; i < Number(noOfNotes); i++) {
      const uniqueId = nanoid().replace(/-/g, "");
      const compositeKey = this._createCompositeKey(ctx.stub, prefix, uniqueId);
      const note = {
        id: uniqueId,
        value: Number(denominationValue),
        denominationId: Number(denominationId),
        isMinted: false,
        owner: this.#initialOwner,
      };
      await this._addData(ctx.stub, compositeKey, note);
    }
  }

  async getNotes(ctx, denominationId) {
    const prefix = this.#prefixNotes + denominationId;
    const allResults = [];
    const iterator = await ctx.stub.getStateByPartialCompositeKey(prefix, []);
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }

    const output = {
      total: allResults.length,
      minted: allResults.filter((item) => item.isMinted === true).length,
      available: allResults.filter((item) => item.isMinted === false).length,
      data: allResults,
    };

    return JSON.stringify(output);
  }

  async getNote(ctx, noteId, denominationId) {
    const prefix = this.#prefixNotes + denominationId;
    const compositeKey = this._createCompositeKey(ctx.stub, prefix, noteId);
    const note = await this._getData(ctx.stub, compositeKey);
    return note;
  }

  async mintNotes(ctx, denominationId, noOfNotes, userId) {
    const notesStringify = await this.getNotes(ctx, denominationId);
    const notesJson = JSON.parse(notesStringify);
    if (notesJson.available >= Number(noOfNotes)) {
      const nonMinted = notesJson.filter((item) => item.isMinted === false);
      const picked = nonMinted.slice(0, noOfNotes);
      const prefix = this.#prefixNotes + denominationId;
      for (let item of picked) {
        const compositeKey = this._createCompositeKey(
          ctx.stub,
          prefix,
          item.id
        );
        item.isMinted = true;
        item.owner = userId;
        await this._updateData(ctx.stub, compositeKey, item);
      }
      return JSON.stringify(picked);
    } else {
      throw new Error(
        `${noOfNotes} notes of Denomination Id ${denominationId} is not available`
      );
    }
  }

  async syncTransferOwnership(ctx, noteId, denominationId, userId) {
    const prefix = this.#prefixNotes + denominationId;
    const compositeKey = this._createCompositeKey(ctx.stub, prefix, noteId);
    const note = await this._getData(ctx.stub, compositeKey);
    const noteJson = JSON.parse(note);
    noteJson.owner = userId;
    await this._updateData(ctx.stub, compositeKey, noteJson);
  }
}

module.exports = CbdcContract;
