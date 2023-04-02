import express from "express";
import { jsonifyHTMLData } from "../utils/examSchedule.js";
import { checkSession, makeRequest } from "../utils/index.js";
const router = express.Router();
const baseUrl = "https://fap.fpt.edu.vn/Exam/ScheduleExams.aspx";
router.get("/", (req, res) => {
  let { id: sid } = req.query;
  if (!sid) {
    res.json({ status: "OK" });
  }

  makeRequest(baseUrl, sid).then((r) => {
    if (checkSession(r.data)) {
      let data = jsonifyHTMLData(r.data);
      if (data) {
        res.json({
          status: "OK",
          data: data,
        });
      } else {
        res.json({
          status: "ERR",
          message: "#TODO",
        });
      }
    } else {
      res.status(400).json({
        status: "LOGGED OUT",
        message: "Please go to FAP and login then try again!",
      });
    }
  });
});

export { router as examSchedule };
