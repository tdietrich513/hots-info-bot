import * as _ from "lodash";
import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";

function barLength(val: number, max: number): number {
  return _.floor((val / max) * 10);
}
export function renderWinRateBarChart(winRates: Array<IWinRate>, dataSelector: (wr: IWinRate) => number): string {
  let chart = "";

  const nameLength = _.chain(winRates)
  .map((wr: IWinRate) => wr.hero.length)
  .max()
  .value();

  const maxPicks = _.chain(winRates)
  .map(dataSelector)
  .max()
  .value();

  chart += "\n```";
  winRates.forEach((wr: IWinRate, i: number) => {
    const rank = _.padStart((i + 1) + "", 2);
    const name = _.padEnd(wr.hero, nameLength);
    const bar = _.padEnd(_.repeat("#", barLength(dataSelector(wr), maxPicks)), 10);
    const absVal = _.padEnd(dataSelector(wr) + "", 6);
    const pctVal = _.round((dataSelector(wr) / HeroData.totalGames) * 100, 0);
    chart += `\n${rank}: ${name}  ${bar} ${absVal} (${pctVal}%)`;
  });
  chart += "\n```";

  return chart;
}

