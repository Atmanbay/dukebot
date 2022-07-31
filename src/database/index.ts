import { Low } from "./Low";
import { JSONFile } from "./JSONFile";
import { BaseDatabaseObject } from "../types/database";
import config from "../utils/config";
import { generateId, getTimestamp } from "../utils";

export class DatabaseTable<DBType extends BaseDatabaseObject> {
  tableName: string;
  dbPath: string;
  #database: Low<DBType[]>;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.dbPath = config.paths.database;
  }

  #getDb = async () => {
    if (!this.#database) {
      const adapter = new JSONFile<DBType[]>(
        `${this.dbPath}/${this.tableName}.json`
      );
      const db = new Low(adapter);
      await db.read();
      this.#database = db;
    }

    return this.#database;
  };

  create = async (object: DBType): Promise<DBType> => {
    const db = await this.#getDb();

    const fullObject = {
      ...object,
      id: generateId(),
      created: getTimestamp(),
    } as DBType;

    db.data.push(fullObject);
    await db.write();
    return fullObject;
  };

  get = async (
    predicate?: (value: DBType, index: number, obj: DBType[]) => boolean
  ): Promise<DBType | null> => {
    const db = await this.#getDb();
    return db.data.find(predicate);
  };

  list = async (
    predicate?: (value: DBType, index: number, obj: DBType[]) => boolean
  ): Promise<DBType[]> => {
    const db = await this.#getDb();
    if (!predicate) {
      return db.data;
    }
    return db.data.filter(predicate);
  };

  update = async (object: DBType): Promise<void> => {
    const db = await this.#getDb();
    const id = object.id;
    const index = db.data.findIndex((value) => value.id === id);
    db.data.splice(index, 1, object);
    return db.write();
  };

  delete = async (id: string): Promise<void> => {
    const db = await this.#getDb();
    const index = db.data.findIndex((value) => value.id === id);
    db.data.splice(index, 1);
    return db.write();
  };
}
