import connect from './db';
import getModels from './models';

export default async () => {
  const models = getModels(connect);
  await models.User.sync({ force: true });
};
