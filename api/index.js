const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const APPRouter = require("./src/routes");

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

app.use("/", APPRouter);

app.listen(port, () => {
  console.log("Server started on : " + port);
});
