import { Router } from "express";
import { db } from "./db";
import { send } from "./response";
import { z } from "zod";
//import {catchErrors} from "./errors";

const router = Router();
