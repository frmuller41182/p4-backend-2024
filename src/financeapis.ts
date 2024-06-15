import { Router } from "express";
import { db } from "./db";
import { send } from "./response";
import { z } from "zod";
//import {catchErrors} from "./errors";

const router = Router();

router.get("/", async (req, res) => {
  const forums = await db.user.findMany();
  send(res).ok(forums);
});

router.get("/:id", async (req, res) => {
  const forum = await db.user.findUnique({
    where: { userId: Number(req.params.id) },
  });
  if (!forum) {
    send(res).notFound();
    return;
  }
  send(res).ok(forum);
});
