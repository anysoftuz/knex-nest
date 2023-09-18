import { BaseResponse, CursorInterface, PageInfoInterface } from "./interfaces";
import type { Knex } from "knex";

export class KnexMagic {
  public static filter<T>(
    query: Knex.QueryBuilder,
    params: T
  ): Knex.QueryBuilder {
    // TODO: implement filter coming soon
    return query;
  }

  /**
   * @description paginate data with cursor pagination method and return data with pagination meta data and total count of data
   * @param query { Knex.QueryBuilder }
   * @param cursorParams { CursorInterface }
   * @param options { { key: string } }
   */
  public static async paginate<T>({
    query,
    cursorParams,
    options,
  }: CursorInterface): Promise<BaseResponse<T>> {
    const cursorColumn = options.key || "id";
    const cursorColumnPrefix = options.keyPrefix || "id";

    const cursorMeta: PageInfoInterface = {
      hasNextPage: false,
      endCursor: null,
      hasPreviousPage: false,
      startCursor: null,
    };

    const whereOperator = this.getWhereOperator(cursorParams.direction);

    if (cursorParams.cursor) {
      query.where(cursorColumnPrefix, whereOperator, cursorParams.cursor);
    }

    const result: T[] = await query.limit(Number(cursorParams.take + 1));

    if (result.length > cursorParams.take) {
      if (cursorParams.direction === "next") {
        cursorMeta.hasNextPage = true;
        if (cursorParams.cursor) {
          cursorMeta.hasPreviousPage = true;
          cursorMeta.startCursor = result[0][cursorColumn];
        }
        cursorMeta.endCursor = result[result.length - 1][cursorColumn];
      } else {
        cursorMeta.hasPreviousPage = true;
        if (cursorParams.cursor) {
          cursorMeta.hasNextPage = true;
          cursorMeta.endCursor = result[result.length - 1][cursorColumn];
        }
        cursorMeta.startCursor = result[0][cursorColumn];
      }
    } else if (result.length > 0 && result.length <= cursorParams.take) {
      if (cursorParams.direction === "next") {
        if (cursorParams.cursor) {
          cursorMeta.hasPreviousPage = true;
          cursorMeta.endCursor = result[0][cursorColumn];
        }
      } else {
        if (cursorParams.cursor) {
          cursorMeta.hasNextPage = true;
          cursorMeta.startCursor = result[result.length - 1][cursorColumn];
        }
      }
    }

    return {
      data: result,
      pageInfo: cursorMeta,
    };
  }

  /**
   * @description get where operator for cursor pagination
   * @param direction
   * @private
   */
  private static getWhereOperator(direction: string) {
    if (direction === "next") {
      return ">";
    } else {
      return "<";
    }
  }
}
