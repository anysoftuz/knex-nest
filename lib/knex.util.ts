import { DEFAULT_CONNECTION_NAME } from "./knex.constants";
import { KnexModuleOptionsI } from "./interfaces";
import { delay, Observable, retryWhen, scan } from "rxjs";
import { Logger } from "@nestjs/common";

const logger = new Logger("KnexModule");

export function getConnectionToken(
  connection: KnexModuleOptionsI | string = DEFAULT_CONNECTION_NAME,
): string | Function {
  if (typeof connection === "string") {
    return connection;
  }
  return `${connection.name || DEFAULT_CONNECTION_NAME}`;
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${
                errorCount + 1
              })...`,
              error.stack,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}
