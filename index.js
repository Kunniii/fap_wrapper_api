import axios from "axios";
import express from "express";
import cors from "cors";
import BodyParser from "body-parser";
import {
  checkSession,
  jsonifyHTMLData,
  makeRequest,
  all,
  any,
} from "./utils.js";

const clog = console.log;
const app = express();
const PORT = process.env.PORT || 9090;

app.use(BodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/attendance", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/attendance", (req, res) => {
  let sid = req.body.id || undefined;
  let id = req.query.id;
  let campus = req.query.campus;
  let term = req.query.term;
  let course = req.query.course;
  if (!sid) {
    res.status(400).json({ status: "NEED SESSION ID" });
  } else {
    if (!all([id, campus, term, course])) {
      if (!any([id, campus, term, course])) {
        makeRequest(sid, null).then((response) => {
          if (checkSession(response.data)) {
            res.json({ status: "OK", data: jsonifyHTMLData(response.data) });
          } else {
            res.status(400).json({ status: "LOGGED OUT" });
          }
        });
      } else {
        res.status(400).json({ status: "NEED MORE PARAMS" });
      }
    } else {
      makeRequest(sid, { id, campus, term, course }).then((response) => {
        if (checkSession(response.data)) {
          res.json({ status: "OK", data: jsonifyHTMLData(response.data) });
        } else {
          res.status(400).json({ status: "LOGGED OUT" });
        }
      });
    }
  }
});

app.listen(PORT, (e) => {
  if (e) {
    clog(e.message);
  } else {
    clog(`OK! Listen on http://localhost:${PORT}`);
  }
});
