import { Response } from "../types/database.js";
import { DatabaseTable } from "./database.js";

export const responses = new DatabaseTable<Response>("responses");
