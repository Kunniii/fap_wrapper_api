import { parse } from "node-html-parser";
import * as cheerio from "cheerio";
import HtmlTableToJson from "html-table-to-json";
import axios from "axios";

const clog = console.log;

const baseUrl = "https://fap.fpt.edu.vn/Exam/ScheduleExams.aspx";
const headers = {
  "authority": "fap.fpt.edu.vn",
  "accept-language": "en-GB,en;q=0.5",
  "cache-control": "max-age=0",
  "referer": "https://fap.fpt.edu.vn/Student.aspx",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "sec-gpc": "1",
  "upgrade-insecure-requests": "1",
  "user-agent": "CodeChoVui.dev",
};

export async function makeRequest(sid, params) {
  return axios.get(baseUrl, {
    headers: {
      ...headers,
      cookie: `ASP.NET_SessionId=${sid}; G_AUTHUSER_H=1; G_ENABLED_IDPS=google`,
    },
    params,
  });
}

//#region

export function checkSession(html) {
  let doc = parse(html);
  let theForms = doc.getElementsByTagName("form");
  for (let form of theForms) {
    if (form.getAttribute("action") == "./Default.aspx") {
      return false;
    }
  }
  return true;
}

export function jsonifyHTMLData(html) {
  const $ = cheerio.load(html);
  let data = HtmlTableToJson.parse($.html($("#ctl00_mainContent_divContent")[0].children));
  return data.results[0];
}

//#endregion
