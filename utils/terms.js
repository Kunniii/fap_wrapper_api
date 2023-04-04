import * as cheerio from "cheerio";
import { getParamsFromHref } from "./index.js";

export function jsonifyHTMLData(html) {
  const $ = cheerio.load(html);
  // div > table > tbody > tr > td > a href > text
  let theDivHasData = $("#ctl00_mainContent_divTerm");
  let table = theDivHasData.find("table");
  let body = table.find("tbody");
  let trs = body.find("tr");
  let current = "";
  let data = [];
  for (let tr of trs) {
    let td = tr.firstChild;
    let tag = td.firstChild.name;
    let name = "";
    if (tag == "b") {
      current = $(td.firstChild).text();
    } else {
      name = $(td.firstChild).text();
      let params = getParamsFromHref(td.firstChild.attributes[0].value);
      data.push({ name: name, ...params });
    }
  }
  data.current = current;
  return data;
}
