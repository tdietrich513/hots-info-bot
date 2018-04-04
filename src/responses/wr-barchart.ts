import * as _ from "lodash";
import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";

function barLength(val: number, max: number): number {
  return _.floor((val / max) * 10);
}
export function renderPopularityBarChart(winRates: Array<IWinRate>, dataSelector: (wr: IWinRate) => number): string {
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

export function renderWinRateBarChart(winRates: Array<IWinRate>): string {
  let chart = "";

  const nameLength = _.chain(winRates)
  .map((wr: IWinRate) => wr.hero.length)
  .max()
  .value();

  const wrOffsets = _.chain(winRates)
   .map((wr: IWinRate) => wr.winRate - 50)
   .value();
  const maxRate = _.round(_.max(wrOffsets));
  const minRate = _.round(_.min(wrOffsets));

  chart += "\n```";
  winRates.forEach((wr: IWinRate, i: number) => {
    const diffFrom50 = _.round(wr.winRate - 50);
    const rank = _.padStart((i + 1) + "", 2);
    const name = _.padEnd(wr.hero, nameLength);
    const lessSection = (diffFrom50 > 0) ? _.repeat(" ", -minRate) : _.padStart(_.repeat("-", -diffFrom50), -minRate);
    const moreSection = (diffFrom50 < 0) ? _.repeat(" ", maxRate) : _.padEnd(_.repeat("+", diffFrom50), maxRate);
    const winRate = wr.winRate.toFixed(1);
    chart += `\n${rank}: ${name} (${winRate}%) ${lessSection}|${moreSection}`;
  });
  chart += "\n```";

  return chart;
}

