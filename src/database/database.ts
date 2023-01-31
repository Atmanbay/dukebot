import fs from "fs";
import { JSONFile, Low } from "lowdb";
import config from "../utils/config.js";
import { generateId } from "../utils/general.js";
import {
  Balance,
  BaseDatabaseObject,
  Blaze,
  BotConfig,
  Job,
  Line,
  Message,
  MessageAction,
  Response,
  TriviaSession,
  Walkup,
} from "./models.js";

class DatabaseTable<DBType extends BaseDatabaseObject> {
  tableName: string;
  #db: Low<DBType[]>;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  build = async () => {
    let path = `${config.paths.database}/${this.tableName}.json`;
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, "[]");
    }

    const adapter = new JSONFile<DBType[]>(path);
    const db = new Low(adapter);
    await db.read();
    this.#db = db;
  };

  create = async (object: Omit<DBType, "id">): Promise<DBType> => {
    const fullObject = {
      ...object,
      id: generateId(),
    } as DBType;

    this.#db.data.push(fullObject);

    await this.#db.write();
    return fullObject;
  };

  get = (
    predicate?: (value: DBType, index: number, obj: DBType[]) => boolean
  ): DBType | null => {
    return this.#db.data.find(predicate);
  };

  list = (
    predicate?: (value: DBType, index: number, obj: DBType[]) => boolean
  ): DBType[] => {
    if (!predicate) {
      return this.#db.data;
    }
    return this.#db.data.filter(predicate);
  };

  update = async (object: DBType): Promise<void> => {
    const id = object.id;
    const index = this.#db.data.findIndex((value) => value.id === id);
    this.#db.data.splice(index, 1, object);
    return this.#db.write();
  };

  delete = async (id: string): Promise<void> => {
    const index = this.#db.data.findIndex((value) => value.id === id);
    this.#db.data.splice(index, 1);
    return this.#db.write();
  };
}

const buildDatabaseTable = async <DBType extends BaseDatabaseObject>(
  tableName: string
) => {
  const dbTable = new DatabaseTable<DBType>(tableName);
  await dbTable.build();
  return dbTable;
};

export const blazes = await buildDatabaseTable<Blaze>("blazes");
export const botConfigs = await buildDatabaseTable<BotConfig>("botConfigs");
export const jobs = await buildDatabaseTable<Job>("jobs");
export const messages = await buildDatabaseTable<Message>("messages");
export const messageActions = await buildDatabaseTable<MessageAction>(
  "messageActions"
);
export const responses = await buildDatabaseTable<Response>("responses");
export const walkups = await buildDatabaseTable<Walkup>("walkups");
export const triviaSessions = await buildDatabaseTable<TriviaSession>(
  "triviaSessions"
);
export const balances = await buildDatabaseTable<Balance>("balances");
export const lines = await buildDatabaseTable<Line>("lines");
