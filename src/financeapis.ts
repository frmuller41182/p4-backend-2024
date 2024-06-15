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
  name: z.string().min(5).max(200),
});

router.get(
  "/",
  catchErrors(async (req, res) => {
    const forums = await db.user.findMany();
    send(res).ok(forums);
  })
);

router.get("/:id", async (req, res, next) => {
  try {
    const params = paramsSchema.parse(req.params);
    const forum = await db.user.findUnique({
      where: { userId: params.id },
    });
    if (!forum) {
      send(res).notFound();
      return;
    }
    send(res).ok(forum);
  } catch (e) {
    next(e);
  }
});

export default router;
