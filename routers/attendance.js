import express from "express";
import {
  checkSession,
  jsonifyHTMLData,
  makeRequest,
  all,
  any,
  massRequest,
  massJsonify,
} from "../utils.js";
const router = express.Router();

router.get("/", (req, res) => {
  let { id: sid, campus, term } = req.query;
  if (sid) {
    makeRequest(sid, { campus, term }).then((response) => {
      if (checkSession(response.data)) {
        let defaultData = jsonifyHTMLData(response.data);
        massRequest(sid, defaultData.courses.courses).then((responses) => {
          res.json({
            status: "OK",
            data: massJsonify([response, ...responses]),
          });
        });
      } else {
        res.status(400).json({
          status: "LOGGED OUT",
          message: "Please go to FAP and login then try again!",
        });
      }
    });
  } else {
    res.json({ status: "OK" });
  }
});

router.post("/", (req, res) => {
  let { id: sid, campus, term } = req.body;

  //--- If not provide a sid, send 400
  if (!sid) {
    res.status(400).json({
      status: "NEED SESSION ID",
      message: "Please provide a SessionID. It is required!",
    });
  } else {
    makeRequest(sid, { campus, term }).then((response) => {
      if (checkSession(response.data)) {
        let defaultData = jsonifyHTMLData(response.data);
        massRequest(sid, defaultData.courses.courses).then((responses) => {
          res.json({
            status: "OK",
            data: massJsonify([response, ...responses]),
          });
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

export { router };
