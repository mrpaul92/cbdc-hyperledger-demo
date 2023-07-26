const { Connection } = require("./connection");
const config = require("./config");

const initLedger = async (req, res) => {
  const connection = new Connection("org1");
  const contract = connection.getContract();
  await contract.submitTransaction("initLedger");
  connection.close();
  return res.json({ success: true, message: "initLedger" });
};

const getDenominations = async (req, res) => {
  const connection = new Connection("org1");
  const contract = connection.getContract();
  const resultBytes = await contract.evaluateTransaction("getDenominations");
  connection.close();
  const resultJson = config.utf8Decoder.decode(resultBytes);
  const result = JSON.parse(resultJson);
  return res.json(result);
};

const getNotes = async (req, res) => {
  const { denominationId } = req.body;
  const connection = new Connection("org1");
  const contract = connection.getContract();
  const resultBytes = await contract.evaluateTransaction(
    "getNotes",
    `${denominationId}`
  );
  connection.close();
  const resultJson = config.utf8Decoder.decode(resultBytes);
  const result = JSON.parse(resultJson);
  return res.json(result);
};

const getNote = async (req, res) => {
  const { noteId, denominationId } = req.body;
  const connection = new Connection("org1");
  const contract = connection.getContract();
  const resultBytes = await contract.evaluateTransaction(
    "getNote",
    `${noteId}`,
    `${denominationId}`
  );
  connection.close();
  const resultJson = config.utf8Decoder.decode(resultBytes);
  const result = JSON.parse(resultJson);
  return res.json(result);
};

const createNotes = async (req, res) => {
  const { denominationId, denominationValue, noOfNotes } = req.body;
  const connection = new Connection("org1");
  const contract = connection.getContract();
  await contract.submitTransaction(
    "createNotes",
    `${denominationId}`,
    `${denominationValue}`,
    `${noOfNotes}`
  );
  connection.close();
  return res.json({ success: true, message: "Created Notes" });
};

const mintNotes = async (req, res) => {
  const { userId } = req.user;
  const { denominationId, noOfNotes } = req.body;
  const connection = new Connection("org1");
  const contract = connection.getContract();
  await contract.submitTransaction(
    "mintNotes",
    `${denominationId}`,
    `${noOfNotes}`,
    `${userId}`
  );
  connection.close();
  return res.json({ success: true, message: "Minted Notes" });
};

const syncTransferOwnership = async (req, res) => {
  // const { userId } = req.user;
  const userId = 9700328328;
  const { denominationId, noteId } = req.body;
  const connection = new Connection("org1");
  const contract = connection.getContract();
  await contract.submitTransaction(
    "syncTransferOwnership",
    `${noteId}`,
    `${denominationId}`,
    `${userId}`
  );
  connection.close();
  return res.json({ success: true, message: "syncTransferOwnership Complete" });
};

const APP = {
  initLedger,
  getDenominations,
  getNotes,
  getNote,
  createNotes,
  mintNotes,
  syncTransferOwnership,
};

module.exports = APP;
