import { Knex } from "knex";

export interface BaseResponse<T> {
  data: T[];
  pageInfo: PageInfoInterface;
}

export interface PageInfoInterface {
  hasNextPage: boolean;
  endCursor: string;
  hasPreviousPage: boolean;
  startCursor: string;
}

export interface CursorInterface {
  query: Knex.QueryBuilder;
  cursorParams: {
    take: number;
    direction: "next" | "prev";
    cursor?: number;
  };
  options?: {
    key: string;
    keyPrefix?: string;
  };
}
