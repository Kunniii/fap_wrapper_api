import express from "express";
import { jsonifyHTMLData, massRequest, massJsonify } from "../utils/attendance.js";

import { makeRequest, checkSession } from "../utils/index.js";
const router = express.Router();

const baseUrl = "https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx";

router.get("/", (req, res) => {
  let { id: sid, campus, term } = req.query;
  if (sid) {
    makeRequest(baseUrl, sid, { campus, term }).then((response) => {
      if (checkSession(response.data)) {
        let defaultData = jsonifyHTMLData(response.data);
        try {
          massRequest(baseUrl, sid, defaultData.courses.courses)
            .then((responses) => {
              res.json({
                status: "OK",
                data: massJsonify([response, ...responses]),
              });
            })
            .catch((e) => {
              res.status(400).json({ status: "FuckAP", message: e.message });
            });
        } catch (e) {
          res.status(400).json({ status: "FuckAP", message: e.message });
        }
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
    makeRequest(baseUrl, sid, { campus, term }).then((response) => {
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

export { router as attendance };
