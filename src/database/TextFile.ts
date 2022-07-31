import fs from "fs";
import { Writer } from "./writer";

import { Adapter } from "./Low";

export class TextFile implements Adapter<string> {
  #filename: string;
  #writer: Writer;

  constructor(filename: string) {
    this.#filename = filename;
    this.#writer = new Writer(filename);
  }

  async read(): Promise<string | null> {
    let data;

    try {
      data = await fs.promises.readFile(this.#filename, {
        encoding: "utf-8",
        flag: "a+",
      });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw e;
    }

    return data;
  }

  write(str: string): Promise<void> {
    return this.#writer.write(str);
  }
}
