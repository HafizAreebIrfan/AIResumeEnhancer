const dotenv = require("dotenv");
dotenv.config();

const env = {
  VITE_UPLOADER: process.env.VITE_UPLOADER || "",
  OPENAI: process.env.OPENAI || "",
  GEMINI: process.env.GEMINI || "",
  USEMODEL: process.env.OPENAIENABLED === "true" ? "openai" : "gemini",
  OPENAIENABLED: process.env.OPENAIENABLED,
};

module.exports = { env };
