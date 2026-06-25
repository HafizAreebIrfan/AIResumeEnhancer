require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ApiCall = require("./src/routes/apiroute");

const app = express();
app.use(
  cors({
    origin: ["https://airesumeenhancer.vercel.app", "http://localhost:4000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use((req, res, next) => {
  next();
});

app.get("/", (req, res) => {
  res.send("Server running on Vercel");
});

app.use("/api", ApiCall);

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;

