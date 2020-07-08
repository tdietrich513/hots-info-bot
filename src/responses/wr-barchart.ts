import * as _ from "lodash";
import { IWinRate } from "../interfaces";
import { HeroData } from "../hero-data";

function barLength(val: number, max: number, scale: number): number {
  return _.floor((val / max) * scale);
}
export function renderPopularityBarChart(winRates: Array<IWinRate>, dataSelector: (wr: IWinRate) => number, descriptor: string): string {
  let chart = "";

  const nameLength = _.chain(winRates)
  .map((wr: IWinRate) => wr.hero.length)
  .max()
  .value();

  const maxPicks = _.chain(winRates)
  .map(dataSelector)
  .max()
  .value();

  const wrOffsets = _.chain(winRates)
   .map((wr: IWinRate) => wr.winRate - 50)
   .value();
  const maxRate = _.round(_.max(wrOffsets));
  const minRate = _.round(_.min(wrOffsets));
  const maxGames = _.chain(winRates)
  .map((wr: IWinRate) => wr.games)
  .max()
  .value();

  chart += "\n```";
  chart += `\n #: ${_.padEnd("Name", nameLength)}  ${_.padEnd(descriptor + " Rate", 20)} Win Rate`;
  winRates.forEach((wr: IWinRate, i: number) => {
    const diffFrom50 = _.round(wr.winRate - 50);
    const rank = _.padStart((i + 1) + "", 2);
    const name = _.padEnd(wr.hero, nameLength);
    const bar = _.padEnd(_.repeat("#", barLength(dataSelector(wr), maxPicks, 10)), 10);
    const absVal = _.padEnd(dataSelector(wr) + "", 6);
    const pctVal = _.round((dataSelector(wr) / HeroData.totalGames) * 100, 0);
    const lessSection =  _.padStart(_.repeat("-", Math.min(-diffFrom50, 5)), 5);
    const moreSection =  _.padEnd(_.repeat("+", Math.min(diffFrom50, 10)), 10);
    const plusMinus = `${lessSection}|${moreSection}`;
    chart += `\n${rank}: ${name}  ${bar} (${_.padStart(pctVal.toString(), 2)}%) ${plusMinus} (${wr.winRate.toFixed(1)}%)`;
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
  const maxGames = _.chain(winRates)
  .map((wr: IWinRate) => wr.games + wr.banCount)
  .max()
  .value();

  chart += "\n```";
  chart += `\n #: ${_.padEnd("Name", nameLength)} ${_.padEnd("Win Rate", 22)} Pick+Ban Rate`;
  winRates.forEach((wr: IWinRate, i: number) => {
    const diffFrom50 = _.round(wr.winRate - 50);
    const rank = _.padStart((i + 1) + "", 2);
    const name = _.padEnd(wr.hero, nameLength);
    const lessSection =  _.padStart(_.repeat("-", Math.min(-diffFrom50, 5)), 5);
    const moreSection =  _.padEnd(_.repeat("+", Math.min(diffFrom50, 10)), 10);
    const winRate = wr.winRate.toFixed(1);
    const plusMinus = `${lessSection}|${moreSection}`;
    const bar = _.padEnd(_.repeat("P", barLength(wr.games, HeroData.totalGames, 10)) + _.repeat("B", barLength(wr.banCount, HeroData.totalGames, 10)), 10);
    const pickAndBanRate = (((wr.games + wr.banCount) / HeroData.totalGames) * 100).toFixed(1).toString();
    chart += `\n${rank}: ${name} ${winRate}% ${plusMinus} ${bar} (${pickAndBanRate}%)`;
  });
  chart += "\n```";

  return chart;
}

