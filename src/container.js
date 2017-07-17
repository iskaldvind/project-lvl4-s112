import dotenv from 'dotenv';

import getModels from './models';
import connect from './db';
import logger from './helpers/logger';

dotenv.config();

const models = getModels(connect);

export default { logger, ...models};