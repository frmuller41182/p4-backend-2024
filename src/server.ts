import cors from "cors";
import express from "express";
import morgan from "morgan";

import router from "./financeapis";
import { defaultErrorHandler } from "./errors";

const app = express();

/* 
GOLDEN RULE of express SERVERS: 
Si tus handlers son async, tiene que poner un try-catch por fuerza!!
Si no, tu servidor se puede morir
*/

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use("/financeapis", router);
app.use(defaultErrorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Forums API listening on http://localhost:${PORT}`);
});
