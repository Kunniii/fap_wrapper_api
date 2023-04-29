import express from "express";
import { checkSession, makeRequest } from "../utils/index.js";
import { jsonifyHTMLData } from "../utils/classSchedule.js";
const router = express.Router();
const baseUrl = "https://fap.fpt.edu.vn/Schedule/TimeTable.aspx";

/* param
campus=6 => cantho -> no need, use current!
term=19 => SP23 -> how to get term? from text eg SP23 -> 19
group=SE1601 
*/

router.get("/", (req, res) => {
  let { id: sid, campus, term, group } = req.query;
  if (!(sid && group)) {
    res.json({ status: "OK", message: "Needed `id`, `term` and `group`" });
  } else {
    makeRequest(baseUrl, sid, { campus, term, group }).then((r) => {
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
  let { id: sid, campus, term, group } = req.body;
  // no need `term`, because it will use the current one
  // same as `campus`
  if (!(sid && group)) {
    res.json({ status: "OK", message: "Needed `id`, `term` and `group`" });
  } else {
    makeRequest(baseUrl, sid, { campus, term, group }).then((r) => {
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

export { router as classSchedule };
