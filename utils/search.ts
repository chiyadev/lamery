import MiniSearch, { Options, SearchOptions } from "minisearch";
import { performance } from "perf_hooks";

export type SearchResult<T> = {
  elapsed: number;
  matches: Match<T>[];
};

export type Match<T> = {
  id: any;
  score: number;
  terms: string[];
  doc: T;
};

// convenient wrapper for minisearch
export class MemorySearch<T extends Record<string, any>> {
  readonly mini: MiniSearch<T>;
  readonly store = new Map<any, T>();

  private readonly idField: string;

  constructor(options: Options<T>) {
    this.mini = new MiniSearch(options);
    this.idField = options.idField || "id";
  }

  index(doc: T) {
    const id = doc[this.idField];
    const oldDoc = this.store.get(id);

    if (oldDoc) {
      this.mini.remove(oldDoc);
    }

    this.mini.add(doc);
    this.store.set(id, doc);
  }

  delete(id: string) {
    const doc = this.store.get(id);

    if (doc) {
      this.mini.remove(doc);
      this.store.delete(id);
    }
  }

  search(queryString: string, searchOptions?: SearchOptions): SearchResult<T> {
    const start = performance.now();
    let matches: Match<T>[];

    // empty query should return all documents
    if (!queryString.trim()) {
      const results = Array.from(this.store.values());

      matches = results.map((item) => ({
        id: item[this.idField],
        score: 0,
        terms: [],
        doc: item,
      }));
    } else {
      const results = this.mini.search(queryString, searchOptions);

      matches = results.map(({ id, score, terms }) => ({
        id,
        score,
        terms,
        doc: this.store.get(id) as T,
      }));
    }

    return {
      elapsed: performance.now() - start,
      matches: matches.sort((a, b) => b.score - a.score),
    };
  }
}
