import {BaseResponse, CursorInterface, FilterParams, PageInfoInterface} from "./interfaces";
import type {Knex} from "knex";

export class KnexMagic {


    /**
     * @description filter data with given params and return query
     * @param query { Knex.QueryBuilder }
     * @param params { FilterParams }
     */
    public static filter(
        query: Knex.QueryBuilder,
        params: FilterParams
    ): Knex.QueryBuilder {
        Object.entries(params).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (Array.isArray(subValue)) {
                        query.whereIn(`${key}.${subKey}`, subValue);
                    } else if (typeof subValue === 'object') {
                        query.whereBetween(`${key}.${subKey}`, [
                            subValue.min,
                            subValue.max,
                        ]);
                    } else {
                        query.where({[`${key}.${subKey}`]: subValue});
                    }
                });
            } else {
                if (Array.isArray(value)) {
                    query.whereIn(key, value);
                } else if (typeof value === 'object') {
                    query.whereBetween(key, [value.min, value.max]);
                } else {
                    query.where({[key]: value});
                }
            }
        });
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
