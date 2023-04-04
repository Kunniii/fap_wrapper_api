import * as cheerio from "cheerio";
import HtmlTableToJson from "html-table-to-json";

const clog = console.log;

export function jsonifyHTMLData(html) {
  const $ = cheerio.load(html);
  let theDivContainsTables = $("#ctl00_mainContent_divDetail");
  let tables = theDivContainsTables.children();
  let schedule = [];
  for (let table of tables) {
    let subject = $(table.firstChild).text();
    let code = subject.split(" ")[0];
    let jsonData = HtmlTableToJson.parse($.html(table)).results[0];
    schedule.push({ subjectCode: code, name: subject, schedules: jsonData });
  }
  return schedule;
}
