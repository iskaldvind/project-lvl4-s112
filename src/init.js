import connect from './db';
import getModels from './models';

export default async () => {
  const models = getModels(connect);

  await models.User.sync({ force: true });
  await models.TaskStatus.sync({ force: true });
  await models.Tag.sync({ force: true });
  await models.TaskTag.sync({ force: true });
  await models.TaskStatus.bulkCreate([
    { name: 'open' },
    { name: 'in work' },
    { name: 'testing' },
    { name: 'closed' },
  ]);
  await models.Task.sync({ force: true });
};
