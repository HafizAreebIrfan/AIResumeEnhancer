require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ApiCall = require("./routes/apiroute");

const app = express();
app.use(
  cors({
    origin: ["https://airesumeenhancer.vercel.app", "http://localhost:4000"],
    credentials: true,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  console.log("Root route hit!");
  res.send("Server running on Vercel");
});

app.get("/", (req, res) => {
  res.send("Server running");
});
app.use("/api", ApiCall);

module.exports = app;
