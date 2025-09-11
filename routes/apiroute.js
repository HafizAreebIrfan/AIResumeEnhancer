const express = require("express");
const { CallAPI,CallInterviewAPI } = require("../controller/apicontroller");
const router = express.Router();

router.post("/analysisapi", CallAPI);
router.post("/interviewapi", CallInterviewAPI);

module.exports = router;
