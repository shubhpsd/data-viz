const express = require("express");
const mongoose = require("mongoose");
const projectRouter = require("./routes/ProjectRoutes.js");

const app = express();

app.use(projectRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`SQLite Server is running on port ${PORT}`);
});
