import { PrismaClient } from "@prisma/client";
import { getUsers } from "../user";
import fs from "fs";

const financedb = new PrismaClient();

//Adding seed data to User entity

const createUsers = async (n: number) => {
  const users = await getUsers(n);
  try {
    for (const user of users) {
      const data = { name: user.name, alias: user.alias, email: user.email };
      console.log("Attempting to create user with data:", data);
      await financedb.user.create({
        data,
      });
      console.log("User created");
    }
  } catch (error) {
    console.error(error);
  }
};
await createUsers(100);

// Adding seed data to Stock entity

const createStocks = async () => {
  console.log("Creating stocks");
  //load the contents of a stocks.json file into a variable
  //loop through the stocks and create a new stock for each one
  //save the stocks to the database
  const stocksData = fs.readFileSync("stocks.json", "utf8");
  const stocks = JSON.parse(stocksData);
  for (const stock of stocks) {
    console.log("Creating stock with data:", stock);
    await financedb.stock.create({
      data: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice,
        industry: stock.industry,
        headQuarters: stock.headQuarters,
        numEmployees: Number(stock.numEmployees),
      },
    });
  }
};

await createStocks();

//Adding Seed data to Transaction entity

const createTransactions = async () => {
  const users = await financedb.user.findMany();
  const stocks = await financedb.stock.findMany();
  console.log("Creating transactions!!");
  for (const user of users) {
    const numberOfTransactions = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < numberOfTransactions; i++) {
      const stock = stocks[Math.floor(Math.random() * stocks.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const type = Math.random() < 0.5 ? "BUY" : "SELL";
      console.log(
        `Alright! Creating transaction for ${user.name} with ${stock.companyName}. They will ${type} ${quantity} stocks at ${stock.currentPrice}`
      );
      await financedb.transaction.create({
        data: {
          priceAtTransaction: stock.currentPrice,
          userId: user.userId,
          stockId: stock.stockId,
          quantity,
          type,
        },
      });
    }
  }
};

await createTransactions();

//Adding Seed data to Portfolio entity

const createPortfolios = async () => {
  const users = await financedb.user.findMany();
  const stocks = await financedb.stock.findMany();
  console.log("Creating portfolios!!");
  for (const user of users) {
    const numberOfPortfolios = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numberOfPortfolios; i++) {
      const stocksInPortfolio = stocks.slice(
        0,
        Math.floor(Math.random() * stocks.length)
      );
      let balance = 0;
      stocksInPortfolio.forEach((stock) => {
        balance += stock.currentPrice;
      });
      console.log(
        `Alright! Creating portfolio for ${user.name} with ${stocksInPortfolio.length} stocks and total balance of ${balance} USD.`
      );
      await financedb.portfolio.create({
        data: {
          userId: user.userId,
          stocks: {
            connect: stocksInPortfolio.map((stock) => ({
              stockId: stock.stockId,
            })),
          },
          balance,
        },
      });
    }
  }
};

await createPortfolios();
