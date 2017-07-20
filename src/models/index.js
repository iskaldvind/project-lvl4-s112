import getUser from './User';
import getTag from './Tag';
import getTask from './Task';
import getTaskStatus from './TaskStatus';

export default connect => {
  const models = {
    User: getUser(connect),
    Tag: getTag(connect),
    Task: getTask(connect),
    TaskStatus: getTaskStatus(connect),
  };

  models.User.hasMany(models.Task);
  models.Task.belongsTo(models.User);
  models.Task.hasMany(models.Tag);
  models.Tag.belongsToMany(models.Task);
  models.Task.hasOne(models.TaskStatus);
  models.TaskStatus.belongsToMany(models.Task);

  return models;
};
