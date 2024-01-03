import type { Knex } from "knex";
import {
  BaseResponse,
  CursorInterface,
  PageInfoInterface,
  FilterParamsInterface,
} from "./interfaces";

export class KnexMagic {
  /**
   * @description filter data with given params and return query
   * @param query { Knex.QueryBuilder }
   * @param params { FilterParamsInterface }
   */
  public static filter(
    query: Knex.QueryBuilder,
    params?: FilterParamsInterface
  ): Knex.QueryBuilder {
    if (!params) {
      return query;
    }

    return Object.entries(params).reduce(
      (query: Knex.QueryBuilder, [key, value]: any) => {
        if (key === "search") {
          const { columns, value: searchValue }: any = value;

          const searchConditions = columns.map((column, index) => {
            const operator =
              index === 0
                ? "LOWER(" + column + ") LIKE ?"
                : " OR LOWER(" + column + ") LIKE ?";

            return operator;
          });
          const likeValue: string = `%${searchValue.toLowerCase()}%`;
          return query.whereRaw(
            "(" + searchConditions.join("") + ")",
            searchConditions.map(() => likeValue)
          );
        }
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          return Object.entries(value).reduce(
            (query, [subKey, subValue]: any) => {
              if (Array.isArray(subValue)) {
                return query.whereIn(key + "." + subKey, subValue);
              }
              if (typeof subValue === "object") {
                return query.whereBetween(key + "." + subKey, [
                  subValue.min,
                  subValue.max,
                ]);
              }
              return query.andWhere({ [key + "." + subKey]: subValue });
            },
            query
          );
        }
        if (Array.isArray(value) && value.length > 0) {
          return query.whereIn(key, value);
        }

        return query.where(key, value);
      },
      query
    );
  }

  /**
   * @description paginate data with cursor pagination method and return data with pagination metadata and total count of data
   * @param query { Knex.QueryBuilder }
   * @param cursorParams { CursorInterface }
   * @param options { { key: string } }
   * @param countQuery { Knex.QueryBuilder }
   */
  public static async paginate<T>({
    query,
    cursorParams,
    options,
    countQuery,
  }: CursorInterface): Promise<BaseResponse<T>> {
    const cursorColumn = options.key || "id";
    const cursorColumnPrefix = options.keyPrefix || "id";
    const cursorId = Number(cursorParams.cursor || 0);
    const cursorTake = Number(cursorParams.take || 10);

    const cursorDirection = cursorParams.direction || "next";
    const cursorMeta: PageInfoInterface = {
      hasNextPage: false,
      endCursor: null,
      hasPreviousPage: false,
      startCursor: null,
    };

    let totalCount: number = 0;
    if (countQuery) {
      const result = await countQuery;
      totalCount = Number(result[0].count || 0);
    } else {
      const countQuery = query
        .clone()
        .clearSelect()
        .clearCounters()
        .clearGroup()
        .clearHaving()
        .clearOrder()
        .count(`${cursorColumnPrefix} as count`);
      const result = await countQuery;
      totalCount = Number(result[0].count || 0);
    }

    const whereOperator = this.getWhereOperator(cursorDirection);

    if (cursorParams.cursor) {
      query.where(cursorColumnPrefix, whereOperator, cursorId);
    }
    const result: any = await query.limit(Number(cursorTake + 1));

    if (result.length > cursorTake) {
      if (cursorDirection === "next") {
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
    } else if (result.length > 0 && result.length <= cursorTake) {
      if (cursorDirection === "next") {
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

    if (result.length >= 2 && result.length !== totalCount) {
      if (cursorDirection === "next") {
        result.pop();
      } else {
        result.shift();
      }
    }

    return {
      data: result,
      pageInfo: cursorMeta,
      totalCount,
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
