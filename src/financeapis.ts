import { Router } from "express";
import { db } from "./db";
import { send } from "./response";
import { z } from "zod";
import { catchErrors } from "./errors";
import { bullMarket } from "../lib/bullMarket";
import { marketCrash } from "../lib/marketCrash";
import { acquisition } from "../lib/acquisition";

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

const getStocksQuerySchema = z.object({
  industry: z.string().min(3).max(50).optional(),
  event: z.string().optional(),
  buySide: z.string().optional(),
  sellSide: z.string().optional(),
});

// 1. Get all Users.

router.get(
  "/users",
  catchErrors(async (_, res) => {
    const users = await db.user.findMany();
    send(res).ok(users);
  })
);

// 2. Get one User

router.get(
  "/users/:id",
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
  "/users/",
  catchErrors(async (req, res) => {
    const body = bodySchema.parse(req.body);
    const createdUser = await db.user.create({
      data: {
        name: body.name,
        alias: body.alias,
        email: body.email,
      },
    });
    send(res).created(createdUser);
  })
);

// 4. Update one User (PUT)
router.put(
  "/users/:id",
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

// 5. Get value of a User's portfolios (GET)

router.get(
  "/users/:id/portfolio-value",
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

//6. Create one Stock (POST)

router.post(
  "/stocks/",
  catchErrors(async (req, res) => {
    const stockData = stockBodySchema.parse(req.body);
    const stockCreated = await db.stock.create({ data: stockData });
    send(res).created(stockCreated);
  })
);

// 7. Get Stocks by Industry

router.get(
  "/stocks/",
  catchErrors(async (req, res) => {
    const { industry } = getStocksQuerySchema.parse(req.query);
    const stocks = await db.stock.findMany({
      where: { industry: industry as string },
    });
    send(res).ok(stocks);
  })
);

// 8. Delete one User
router.delete(
  "/users/:id",
  catchErrors(async (req, res) => {
    const params = paramsSchema.parse(req.params);
    await db.transaction.deleteMany({
      where: { userId: params.id },
    });
    await db.portfolio.deleteMany({
      where: { userId: params.id },
    });
    const deltedUser = await db.user.delete({
      where: { userId: params.id },
    });
    send(res).ok(deltedUser);
  })
);

//9. Market Manipulation API

router.post(
  "/market/manipulation",
  catchErrors(async (req, res) => {
    const { event } = getStocksQuerySchema.parse(req.query);
    if (event === "Bull") {
      await bullMarket();
    } else if (event === "Bear") {
      await marketCrash();
    }
    send(res).created(`${event} market simulation complete!`);
  })
);

//10. Acquisition Simulator (POST)

router.post(
  "/market/acquisition",
  catchErrors(async (req, res) => {
    const { buySide, sellSide } = getStocksQuerySchema.parse(req.query);
    await acquisition(buySide as string, sellSide as string);
    send(res).created(
      `The ${buySide} has successfully acquired ${sellSide}! Will the regulators allow it or will they ban it due to antitrust concerns?`
    );
  })
);

export default router;
