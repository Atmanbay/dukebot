import { Response } from "../types/database";
import { DatabaseTable } from "../database";

export const responses = new DatabaseTable<Response>("responses");
