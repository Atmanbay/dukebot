import { Adapter } from "./Low";
import { TextFile } from "./TextFile";

export class JSONFile<T> implements Adapter<T> {
  #adapter: TextFile;

  constructor(filename: string) {
    this.#adapter = new TextFile(filename);
  }

  async read(): Promise<T | null> {
    const data = await this.#adapter.read();
    if (data === null) {
      return null;
    } else {
      if (data.length === 0) {
        return JSON.parse("[]") as T;
      } else {
        return JSON.parse(data) as T;
      }
    }
  }

  write(obj: T): Promise<void> {
    return this.#adapter.write(JSON.stringify(obj, null, 2));
  }
}
