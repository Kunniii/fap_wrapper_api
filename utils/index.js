import { parse } from "node-html-parser";
import axios from "axios";

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

export async function makeRequest(baseUrl, sid, params) {
  return axios.get(baseUrl, {
    headers: {
      ...headers,
      cookie: `ASP.NET_SessionId=${sid}; G_AUTHUSER_H=1; G_ENABLED_IDPS=google`,
    },
    params,
  });
}

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

export function getParamsFromHref(href) {
  let params = {};
  href = href.replaceAll("?", "");
  let array = href.split("&");
  for (let item of array) {
    let key = item.split("=")[0];
    let value = item.split("=")[1];
    params[key] = value;
  }
  return params;
}
