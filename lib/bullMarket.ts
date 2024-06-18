/* 
In this script I will simulate a bull market, and update the current price of all stocks to be between 30 and 70% more.
*/

import { PrismaClient } from "@prisma/client";
import { getRandomNumber } from "./getRandomNumber";

export const financedb = new PrismaClient();

export const bullMarket = async () => {
  const logs: string[] = [];
  const numStocksAfected = getRandomNumber(5, 60);
  const stocks = await financedb.stock.findMany({ take: numStocksAfected });
  for (const stock of stocks) {
    const priceIncrease = getRandomNumber(0.3, 0.7);
    const newPrice = (
      stock.currentPrice +
      stock.currentPrice * priceIncrease
    ).toFixed(2);
    await financedb.stock.update({
      where: { stockId: stock.stockId },
      data: { currentPrice: parseFloat(newPrice) },
    });
    logs.push(
      `Stock ${
        stock.symbol
      } has benefited from the bullish market rush!! Their share price rosed from ${stock.currentPrice.toFixed(
        2
      )} to ${newPrice} USD. This represents an increase of ${(
        priceIncrease * 100
      ).toFixed(2)}%.`
    );
  }
  logs.push("Bull market simulation complete!");
  await financedb.marketEvent.create({
    data: {
      eventName: "BullMarket",
      affectedStocks: {
        connect: stocks.map((stock) => ({ stockId: stock.stockId })),
      },
    },
  });
  return logs;
};
