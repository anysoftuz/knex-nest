import { ModuleMetadata, Type } from "@nestjs/common";
import * as knex from "knex";

export type Knex = knex.Knex;
export type Connection = knex.Knex;

export interface KnexModuleOptionsI {
  name?: string;
  config: knex.Knex.Config;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface KnexOptionsFactoryI {
  createKnexOptions(
    connectionName?: string,
  ): Promise<KnexModuleOptionsI> | KnexModuleOptionsI;
}

export interface KnexModuleAsyncOptionsI
  extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  inject?: any[];
  useClass?: Type<KnexOptionsFactoryI>;
  useExisting?: Type<KnexOptionsFactoryI>;
  useFactory?: (
    ...args: any[]
  ) => Promise<KnexModuleOptionsI> | KnexModuleOptionsI;
}
