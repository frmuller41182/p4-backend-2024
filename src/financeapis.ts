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

// Get all Users.

router.get(
  "/",
  catchErrors(async (req, res) => {
    const forums = await db.user.findMany();
    send(res).ok(forums);
  })
);

//Get one User

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

// Create one User
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

//Update one User
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

//Get value of a User's portfolios

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

//Delete one Transaction
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
