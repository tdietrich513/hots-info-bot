import { convertUrl } from "tabletojson";
import { IWinRate } from "./interfaces";
import * as _ from "lodash";

interface IRawRow {
  "Banned / Ban Rate": string;
  "Games Played": string;
  Hero: string;
  "Win Rate": string;
}

export function getWinRates(callBack: (winRates: IWinRate[]) => void) {
  const heroNamePattern = /[^\n]+/i;
  const banPattern = /([\d|\,]+)\s+(\(\d+\.\d+\%\))/i;

  convertUrl("https://stormspy.net/", {}, (parseOutput: any) => {
    const rawTable: IRawRow[] = parseOutput[0];
    const table: IWinRate[] = _.map(rawTable, (row: IRawRow): IWinRate => {
      const bansData = row["Banned / Ban Rate"].match(banPattern);
      const banCount = parseInt(bansData[1].replace(",", ""));
      const bansPct = parseFloat(bansData[2].slice(1, bansData[2].length));
      let heroName = row.Hero.match(heroNamePattern)[0];
      if (heroName == "Lúcio") heroName = "Lucio";

      const output: IWinRate =  {
        games: parseInt(row["Games Played"].replace(",", "")),
        hero: heroName,
        winRate: parseFloat(row["Win Rate"]),
        banCount: banCount,
        banRate: bansPct
      };

      return output;
    });

    _.chain(table)
      .sortBy((wr: IWinRate) => -wr.banRate)
      .value().forEach((wr, i) => {
        wr.banRank = i + 1;
      });

    _.chain(table)
      .sortBy((wr: IWinRate) => -wr.games)
      .value().forEach((wr, i) => {
        wr.popRank = i + 1;
      });

    callBack(table);
  });
}