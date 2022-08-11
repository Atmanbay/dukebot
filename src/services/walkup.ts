import { Walkup } from "../types/database.js";
import { DatabaseTable } from "./database.js";

export const walkups = new DatabaseTable<Walkup>("walkups");
