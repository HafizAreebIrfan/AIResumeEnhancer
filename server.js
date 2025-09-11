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
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server running");
});
app.use("/api", ApiCall);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
