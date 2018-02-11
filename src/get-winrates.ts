import { convert } from "tabletojson";
import { IWinRate } from "./interfaces";
import * as _ from "lodash";
import { exec, ChildProcess } from "child_process";

interface IRawRow {
  Hero: string;
  "Games Played": string;
  "Games Banned": string;
  Popularity: string;
  "Win Percent": string;
}

export function getWinRates(callBack: (winRates: IWinRate[]) => void) {
  const program: ChildProcess = exec(`${process.env.PHANTOMJS_BIN || "phantomjs"} ./scrape-page.js`);
  let body = "";
  program.stderr.pipe(process.stderr);
  program.stdout.on("data", data => {
    body += data;
  });
  program.stdout.on("end", () => {
    const rawTable = convert(body)[1];
    const table: IWinRate[] = _.map(rawTable, (row: IRawRow): IWinRate => {
      const output: IWinRate = {
        hero: row.Hero,
        games: parseInt(row["Games Played"].replace(",", "")),
        winRate: parseFloat(row["Win Percent"].replace(/\s\%/i, "")),
        banCount: parseInt(row["Games Banned"].replace(",", "")),
        popRate: parseFloat(row.Popularity.replace(/\s\%/i, ""))
      };
      return output;
    });

    _.chain(table)
      .sortBy((wr: IWinRate) => -wr.banCount)
      .value().forEach((wr, i) => {
        wr.banRank = i + 1;
      });

    _.chain(table)
      .sortBy((wr: IWinRate) => -wr.popRate)
      .value().forEach((wr, i) => {
        wr.popRank = i + 1;
      });

    callBack(table);
  });
}