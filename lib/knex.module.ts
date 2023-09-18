import { DynamicModule, Module } from '@nestjs/common';
import { KnexCoreModule } from './knex.core.module';
import { KnexModuleAsyncOptionsI, KnexModuleOptionsI } from './interfaces';

@Module({})
export class KnexModule {
  public static forRoot(options: KnexModuleOptionsI, connection?: string): DynamicModule {
    return {
      module: KnexModule,
      imports: [KnexCoreModule.forRoot(options, connection)],
    };
  }

  public static forRootAsync(options: KnexModuleAsyncOptionsI, connection?: string): DynamicModule {
    return {
      module: KnexModule,
      imports: [KnexCoreModule.forRootAsync(options, connection)],
    };
  }
}
