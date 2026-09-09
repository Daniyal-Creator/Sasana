// Types for `node:sqlite`, which Node 24 ships but `@types/node` v20 does not
// yet describe.
//
// Declared here rather than by raising `@types/node`, because that package is
// shared by every area of the backend and README's rule on files more than one
// area touches is explicit: add a dependency freely, never bump somebody
// else's version. A raise from 20 to 24 could surface unrelated type errors in
// code this branch has no business changing.
//
// Only the surface `lib/cache.ts` actually uses is described. Anything beyond
// it should be added deliberately, and the whole file deleted once
// `@types/node` catches up.

declare module "node:sqlite" {
  /** A value SQLite can store or hand back. */
  type SQLValue = string | number | bigint | null | Uint8Array;

  export interface StatementSync {
    /** The first matching row, or undefined when there is none. */
    get(...params: SQLValue[]): unknown;
    /** Every matching row. */
    all(...params: SQLValue[]): unknown[];
    run(...params: SQLValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean });
    /** Runs one or more statements with no parameters and no result. */
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
