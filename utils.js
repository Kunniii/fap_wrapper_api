import { parse } from "node-html-parser";
import HtmlTableToJson from "html-table-to-json";
import axios from "axios";

const clog = console.log;

const baseUrl = "https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx";
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

export async function massRequest(sid, courses) {
  let pages = [];

  for (let c of courses) {
    if (c.url == "None") continue;
    pages.push({ name: c.name, url: c.url, params: c.requestParams });
  }

  return axios.all(pages.map((page) => makeRequest(sid, page.params))).then(
    axios.spread((...responses) => {
      return responses;
    })
  );
}

export function massJsonify(responses) {
  let reports = [];
  let terms = {};
  for (let res of responses) {
    let data = jsonifyHTMLData(res.data);
    terms["current"] = data.terms.current;
    let name = data.courses.current;
    let report = data.currentCourseReport;
    reports.push({ name, reports: report });
  }
  return { terms, reports };
}

//#region

export function all(arr) {
  for (let i of arr) {
    if (!i) return false;
  }
  return true;
}

export function any(arr) {
  for (let i of arr) {
    if (i) return true;
  }
  return false;
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

export function jsonifyHTMLData(html) {
  try {
    let doc = parse(html);

    let termsHTML = doc.getElementsByTagName("table")[2].innerHTML;
    let coursesHTML = doc.getElementsByTagName("table")[3].innerHTML;
    let reportsHTML = doc.getElementsByTagName("table")[4].innerHTML;

    let termsData = extractDataFromTermsHTML(termsHTML);
    let coursesData = extractDataFromCoursesHTML(coursesHTML);
    let reportsData = extractDataFromReportsHTML(reportsHTML);

    // Try to fix the bad typo that FU has in FAP :) when it's fixed, please tell me

    reportsData.map((data) => {
      let theCopy = { "Attendance status": data["Attedance status"], ...data };
      return theCopy;
    });

    // clog({
    //   terms: termsData,
    //   courses: coursesData,
    //   currentCourseReport: reportsData,
    // });

    return {
      terms: termsData,
      courses: coursesData,
      currentCourseReport: reportsData,
    };
  } catch (error) {
    return {};
  }
}

function getParamsFromHref(href) {
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

function extractDataFromReportsHTML(html) {
  let doc = HtmlTableToJson.parse(`<table>${html}</table>`);
  let reports = doc.results[0];
  reports.pop();
  for (let index in reports) {
    let slot_time = reports[index].Slot;
    let slot = slot_time.split("_")[0];
    let time = slot_time.split("_")[1].replace(")", "").replace("(", "");
    reports[index] = { ...reports[index], Slot: slot, Time: time };
  }
  return reports;
}

function extractDataFromCoursesHTML(html) {
  let coursesData = [];
  let doc = parse(html);
  let rows = doc.getElementsByTagName("tr");
  let courseName, url, current, requestParams, queryString;
  for (let row of rows) {
    for (let child of row.childNodes) {
      if (child.rawTagName) {
        let el = child.childNodes[0];
        if (el.rawTagName == "b") {
          courseName = child.getElementsByTagName("b")[0].text.replace(/\)\(.*\)/g, ")");
          url = "None";
          current = courseName;
        } else {
          let href = child.getElementsByTagName("a")[0].getAttribute("href");
          courseName = child.getElementsByTagName("a")[0].text;
          url = "https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx" + href;
          requestParams = getParamsFromHref(href);
          queryString = href;
        }
      }
    }
    coursesData.push({
      name: courseName,
      url,
      requestParams,
      queryString,
    });
  }
  return { current: current, courses: coursesData };
}

function extractDataFromTermsHTML(html) {
  let termsData = [];
  let doc = parse(html);
  // extract terms data
  let rows = doc.getElementsByTagName("tr");
  // tr
  let termName, url, selected, current, requestParams, queryString;
  for (let row of rows) {
    // td
    for (let child of row.childNodes) {
      if (child.rawTagName) {
        // <a></a> || <b></b>
        let el = child.childNodes[0];
        if (el.rawTagName == "b") {
          termName = el.text;
          url = "None";
          selected = true;
          current = termName;
        } else {
          let href = child.getElementsByTagName("a")[0].getAttribute("href");
          selected = false;
          termName = el.text;
          url = "https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx" + href;
          requestParams = getParamsFromHref(href);
          queryString = href;
        }
      }
    }
    termsData.push({
      name: termName,
      url,
      selected,
      requestParams,
      queryString,
    });
  }
  return { current, terms: termsData };
}
//#endregion
