import express from "express";
import cors from "cors";
import BodyParser from "body-parser";

import { attendance } from "./routers/attendance.js";
import { examSchedule } from "./routers/examSchedule.js";
import { classSchedule } from "./routers/classSchedule.js";
import { terms } from "./routers/terms.js";

const clog = console.log;
const app = express();
const PORT = process.env.PORT || 9090;

app.use(BodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/attendance", attendance);
app.use("/exam", examSchedule);
app.use("/schedule", classSchedule);
app.use("/terms", terms);

app.listen(PORT, (e) => {
  if (e) {
    clog(e.message);
  } else {
    clog(`OK! Listen on http://localhost:${PORT}`);
  }
});
