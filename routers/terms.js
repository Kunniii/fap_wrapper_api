import express from "express";
import { checkSession, makeRequest } from "../utils/index.js";
import { jsonifyHTMLData } from "../utils/terms.js";
const router = express.Router();
const baseUrl = "https://fap.fpt.edu.vn/Schedule/TimeTable.aspx";

router.get("/", (req, res) => {
  let { id: sid } = req.query;
  if (!sid) {
    res.json({ status: "OK", message: "Need your `id`" });
  } else {
    makeRequest(baseUrl, sid).then((r) => {
      if (checkSession(r.data)) {
        let data = jsonifyHTMLData(r.data);
        res.json({
          status: "OK",
          data: data,
        });
      } else {
        res.status(400).json({
          status: "LOGGED OUT",
          message: "Please go to FAP and login then try again!",
        });
      }
    });
  }
});

router.post("/", (req, res) => {
  let { id: sid } = req.body;
  if (!sid) {
    res.json({ status: "OK", message: "Need your `id`" });
  } else {
    makeRequest(baseUrl, sid).then((r) => {
      if (checkSession(r.data)) {
        let data = jsonifyHTMLData(r.data);
        res.json({
          status: "OK",
          data: data,
        });
      } else {
        res.status(400).json({
          status: "LOGGED OUT",
          message: "Please go to FAP and login then try again!",
        });
      }
    });
  }
});

export { router as terms };
