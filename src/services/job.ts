import { Job } from "../types/database.js";
import { DatabaseTable } from "./database.js";

export const jobs = new DatabaseTable<Job>("jobs");
