import getUser from './User';
import getTag from './Tag';
import getTask from './Task';
import getTaskStatus from './TaskStatus';
import getStatus from './Status';

export default (connect) => {
  const models = {
    User: getUser(connect),
    Status: getStatus(connect),
    Tag: getTag(connect),
    Task: getTask(connect),
    TaskStatus: getTaskStatus(connect),
  };

  models.User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'creator' });
  models.User.hasMany(models.Task, { foreignKey: 'assignedToId', as: 'assignedTo' });
  models.Task.belongsTo(models.User, { as: 'creator' });
  models.Task.belongsTo(models.User, { as: 'assignedTo' });
  models.Task.belongsTo(models.TaskStatus, { as: 'status' });
  models.Task.belongsToMany(models.Tag, { through: 'Status' });
  models.Tag.belongsToMany(models.Task, { through: 'Status' });
  models.TaskStatus.hasMany(models.Task, { foreignKey: 'statusId', as: 'status' });

  return models;
};
