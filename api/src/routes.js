const { Router } = require("express");
const APP = require("./app");
const authMiddleware = require("./middlewares/auth");

const APPRouter = Router();

APPRouter.get("/", (req, res) => {
  res.json({ success: true, message: "200 Ok" });
});

APPRouter.get("/init", [authMiddleware], APP.initLedger);

APPRouter.get("/getDenominations", [authMiddleware], APP.getDenominations);
APPRouter.post("/getNotes", [authMiddleware], APP.getNotes);
APPRouter.post("/getNote", [authMiddleware], APP.getNote);
APPRouter.post("/createNotes", [authMiddleware], APP.createNotes);
APPRouter.post("/mintNotes", [authMiddleware], APP.mintNotes);
APPRouter.post(
  "/syncTransferOwnership",
  [authMiddleware],
  APP.syncTransferOwnership
);

module.exports = APPRouter;
