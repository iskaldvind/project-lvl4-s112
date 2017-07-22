import getUser from './User';
import getTag from './Tag';
import getTask from './Task';
import getTaskStatus from './TaskStatus';
import getTaskTag from './TaskTag';

export default (connect) => {
  const models = {
    User: getUser(connect),
    Tag: getTag(connect),
    Task: getTask(connect),
    TaskTag: getTaskTag(connect),
    TaskStatus: getTaskStatus(connect),
  };

  models.User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'creator' });
  models.User.hasMany(models.Task, { foreignKey: 'assignedToId', as: 'assignedTo' });
  models.Task.belongsTo(models.User, { as: 'creator' });
  models.Task.belongsTo(models.User, { as: 'assignedTo' });
  models.Task.belongsTo(models.TaskStatus, { as: 'status' });
  models.Task.belongsToMany(models.Tag, { through: 'TaskTag' });
  models.Tag.belongsToMany(models.Task, { through: 'TaskTag' });
  models.TaskStatus.hasMany(models.Task, { foreignKey: 'statusId', as: 'status' });

  return models;
};
