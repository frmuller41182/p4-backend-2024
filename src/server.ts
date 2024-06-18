import cors from "cors";
import express from "express";
import morgan from "morgan";

import router from "./financeapis";
import { defaultErrorHandler } from "./errors";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/financeapis", router);
app.use(defaultErrorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Finance APP Backend listening on http://localhost:${PORT}`);
});
