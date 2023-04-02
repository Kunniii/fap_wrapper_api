import express from "express";
import cors from "cors";
import BodyParser from "body-parser";

import { router as attendance } from "./routers/attendance.js";
import { examSchedule } from "./routers/examSchedule.js";

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

app.listen(PORT, (e) => {
  if (e) {
    clog(e.message);
  } else {
    clog(`OK! Listen on http://localhost:${PORT}`);
  }
});
