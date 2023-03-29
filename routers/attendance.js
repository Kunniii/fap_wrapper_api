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
  let { id: sid } = req.query;
  if (sid) {
    makeRequest(sid, null).then((response) => {
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
  let sid = req.body.id || undefined;
  let id = req.query.id;
  let campus = req.query.campus;
  let term = req.query.term;

  //--- If not provide a sid, send 400
  if (!sid) {
    res.status(400).json({
      status: "NEED SESSION ID",
      message: "Please provide a SessionID. It is required!",
    });
  }

  //--- !all means not all [items] has value
  if (!all([id, campus, term])) {
    if (any([id, campus, term])) {
      res.json({
        status: "QUERY STRING MISSING",
        message: "All 3 params [id, campus, term] must set or DO NOT include query string.",
      });
    } else {
      makeRequest(sid, null).then((response) => {
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
  }
  //--- If all [items] has value
  if (all([id, campus, term])) {
    makeRequest(sid, { id, campus, term }).then((response) => {
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
