import { parse } from "node-html-parser";
import HtmlTableToJson from "html-table-to-json";
import axios from "axios";
import { makeRequest, getParamsFromHref } from "./index.js";

const clog = console.log;

export async function massRequest(baseUrl, sid, courses) {
  let pages = [];

  for (let c of courses) {
    if (c.url == "None") continue;
    pages.push({ name: c.name, url: c.url, params: c.requestParams });
  }

  return axios.all(pages.map((page) => makeRequest(baseUrl, sid, page.params))).then(
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
    terms["terms"] = data.terms.terms;
    let name = data.courses.current;
    let report = data.currentCourseReport;
    reports.push({ name, reports: report });
  }
  return reports;
}

//#region

export function jsonifyHTMLData(html) {
  try {
    let doc = parse(html);

    let termsHTML = doc.getElementsByTagName("table")[2].innerHTML;
    let coursesHTML = doc.getElementsByTagName("table")[3].innerHTML;
    let reportsHTML = doc.getElementsByTagName("table")[4].innerHTML;

    let termsData = extractDataFromTermsHTML(termsHTML);
    let coursesData = extractDataFromCoursesHTML(coursesHTML);
    let reportsData = extractDataFromReportsHTML(reportsHTML);

    return {
      terms: termsData,
      courses: coursesData,
      currentCourseReport: reportsData,
    };
  } catch (error) {
    return {};
  }
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
  let termsData = {};
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
    termsData[termName] = {
      name: termName,
      url,
      selected,
      requestParams,
      queryString,
    };
  }
  return { current, terms: termsData };
}
//#endregion
