import { ModuleMetadata, Type } from "@nestjs/common";
import { Knex } from "knex";

export interface KnexModuleOptionsI {
  name?: string;
  config: Knex.Config;
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
