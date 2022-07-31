export interface Adapter<T> {
  read: () => Promise<T | null>;
  write: (data: T) => Promise<void>;
}

export class Low<T = unknown> {
  adapter: Adapter<T>;
  data: T | null = null;

  constructor(adapter: Adapter<T>) {
    this.adapter = adapter;
  }

  async read(): Promise<void> {
    this.data = await this.adapter.read();
  }

  async write(): Promise<void> {
    if (this.data) {
      await this.adapter.write(this.data);
    }
  }
}
