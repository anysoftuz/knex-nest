import {Inject} from '@nestjs/common';
import {getConnectionToken} from './knex.util';
import {KnexModuleOptionsI} from "../interfaces";

export const InjectKnex = (connection?: string) => {
    return Inject(getConnectionToken(connection));
};

export const InjectConnection: (
    connection?: KnexModuleOptionsI | string,
) => ParameterDecorator = (connection?: KnexModuleOptionsI | string) =>
    Inject(getConnectionToken(connection));



