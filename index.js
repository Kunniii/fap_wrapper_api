import express from "express";
import cors from "cors";
import BodyParser from "body-parser";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";

import { attendance } from "./routers/attendance.js";
import { examSchedule } from "./routers/examSchedule.js";
import { classSchedule } from "./routers/classSchedule.js";
import { terms } from "./routers/terms.js";

const clog = console.log;
const app = express();
const PORT = process.env.PORT || 9090;
const logStream = createStream("access.log", {
  interval: "1d",
  compress: "gzip",
  teeToStdout: true,
  path: "./logs/",
});

app.use(BodyParser.json());
app.use(cors());
app.use(morgan("combined", { stream: logStream }));
// app.use(morgan("short"));

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
    clog(
      `Listening on port ${PORT}\nIf you are using Docker, the logs can be found at /app/logs/\n`
    );
  }
});
