import { Walkup } from "../types/database";
import { DatabaseTable } from "../database";

export const walkups = new DatabaseTable<Walkup>("walkups");
