import { Router } from "express";
import { db } from "./db";
import { send } from "./response";
import { z } from "zod";
import { catchErrors } from "./errors";

//import {catchErrors} from "./errors";

/*
Que tienen que hacer los endpoints?

1. Obtener los datos de entrada:
    - Parámetros (/abc/:x/def:y)
    - Request body
    - Query Parameters (ej., /view?withProfit=True)
2. Validar esos datos (si están mal --> Bad Request error throw.)
3. Consultas o modificaciones (GET,POST,PUT,DELETE,etc.)
    - Gestión de excepciones.
4. Devolver el resultado.
*/

const router = Router();

const paramsSchema = z.object({
  id: z.coerce.number(),
});

const bodySchema = z.object({
  name: z.string().min(5).max(50),
  alias: z.string().min(3).max(20),
  email: z.string().email(),
});

const stockBodySchema = z.object({
  symbol: z.string().max(4),
  companyName: z.string().min(4).max(30),
  currentPrice: z.coerce.number().nonnegative().positive(),
  industry: z.string().min(4).max(20),
  headQuarters: z.string().min(4).max(20),
  numEmployees: z.coerce.number(),
});

/*
{
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice,
        industry: stock.industry,
        headQuarters: stock.headQuarters,
        numEmployees: Number(stock.numEmployees),
      },*/

// 1. Get all Users.

router.get(
  "/",
  catchErrors(async (_, res) => {
    const forums = await db.user.findMany();
    send(res).ok(forums);
  })
);

// 2. Get one User

router.get(
  "/user/:id",
  catchErrors(async (req, res) => {
    const params = paramsSchema.parse(req.params);
    const user = await db.user.findUnique({
      where: { userId: params.id },
    });
    send(res).ok(user);
  })
);

// 3. Create one User (POST)
router.post(
  "/newUser/",
  catchErrors(async (req, res) => {
    const body = bodySchema.parse(req.body);
    const createdUser = await db.user.create({
      data: {
        name: body.name,
        alias: body.alias,
        email: body.email,
      },
    });
    send(res).ok(createdUser);
  })
);

// 4. Update one User (PUT)
router.put(
  "/:id",
  catchErrors(async (req, res) => {
    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);
    const updatedUser = await db.user.update({
      where: { userId: params.id },
      data: {
        name: body.name,
        alias: body.alias,
        email: body.email,
      },
    });
    send(res).ok(updatedUser);
  })
);

// 5. Get value of a User's portfolios

router.get(
  "/UserPortfolioValue/:id",
  catchErrors(async (req, res) => {
    const params = paramsSchema.parse(req.params);
    const user = await db.user.findUnique({ where: { userId: params.id } });
    const { name, alias, email } = user ?? {};
    const portfolios = await db.portfolio.findMany({
      where: { userId: params.id },
      include: {
        stocks: true,
      },
    });
    const portfolioValues = portfolios.map((portfolio) => {
      const totalValue = portfolio.stocks.reduce((acc, stock) => {
        return acc + stock.currentPrice;
      }, 0);
      return totalValue;
    });
    send(res).ok(
      `The combined value of the portfolios for user ${
        name + " " + alias
      } is ${portfolioValues
        .reduce((acc, portfolio) => {
          return acc + portfolio;
        }, 0)
        .toFixed(2)}`
    );
  })
);

//6. Create one Stock

router.post(
  "/createStock",
  catchErrors(async (req, res) => {
    const stockData = stockBodySchema.parse(req.body);
    const stockCreated = await db.stock.create({ data: stockData });
    send(res).created(stockCreated);
  })
);

// 7. Delete one Transaction
router.delete(
  "/:id",
  catchErrors(async (req, res) => {
    const params = paramsSchema.parse(req.params);
    const deltedUser = await db.transaction.delete({
      where: { transactionId: params.id },
    });
    send(res).ok(deltedUser);
  })
);

export default router;
