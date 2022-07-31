import { Job } from "../types/database";
import { DatabaseTable } from "../database";

export const jobs = new DatabaseTable<Job>("jobs");
