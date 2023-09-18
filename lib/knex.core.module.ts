import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import {
  KnexModuleAsyncOptionsI,
  KnexModuleOptionsI,
  KnexOptionsFactoryI,
} from "./interfaces";
import { KNEX_MODULE_OPTIONS } from "./knex.constants";
import { knex, Knex } from "knex";
import { getConnectionToken, handleRetry } from "./knex.util";
import { defer, lastValueFrom } from "rxjs";

@Global()
@Module({})
export class KnexCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(KNEX_MODULE_OPTIONS)
    private readonly options: KnexModuleOptionsI,
    private readonly moduleRef: ModuleRef,
  ) {}

  public static createAsyncProviders(
    options: KnexModuleAsyncOptionsI,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<KnexOptionsFactoryI>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  public static forRootAsync(
    options: KnexModuleAsyncOptionsI,
    connection: string,
  ): DynamicModule {
    const connectionProvider: Provider = {
      provide: getConnectionToken(connection),
      useFactory: async (options: KnexModuleOptionsI) => {
        return await this.createConnectionFactory(options);
      },
      inject: [KNEX_MODULE_OPTIONS],
    };

    return {
      module: KnexCoreModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options), connectionProvider],
      exports: [connectionProvider],
    };
  }

  public static forRoot(
    options: KnexModuleOptionsI,
    connection?: string,
  ): DynamicModule {
    const knexModuleOptions = {
      provide: KNEX_MODULE_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      provide: getConnectionToken(connection),
      useFactory: async () => await this.createConnectionFactory(options),
    };

    return {
      module: KnexCoreModule,
      providers: [connectionProvider, knexModuleOptions],
      exports: [connectionProvider],
    };
  }

  public static createAsyncOptionsProvider(
    options: KnexModuleAsyncOptionsI,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: KNEX_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
  }

  private static async createConnectionFactory(
    options: KnexModuleOptionsI,
  ): Promise<Knex> {
    return lastValueFrom(
      defer(async () => {
        return knex(options.config);
      }).pipe(handleRetry(options.retryAttempts, options.retryDelay)),
    );
  }

  async onApplicationShutdown(): Promise<any> {
    const connection = this.moduleRef.get<Knex>(
      getConnectionToken(this.options as KnexModuleOptionsI) as Type<Knex>,
    );
    connection && (await connection.destroy());
  }
}
