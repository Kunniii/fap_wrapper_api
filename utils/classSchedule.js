import * as cheerio from "cheerio";
import HtmlTableToJson from "html-table-to-json";

const clog = console.log;

export function jsonifyHTMLData(html) {
  const $ = cheerio.load(html);
  let data = HtmlTableToJson.parse($.html($("#ctl00_mainContent_divContent")[0].children));
  return data.results[0];
}
