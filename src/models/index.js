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

  models.User.hasMany(Task);
  models.Task.belongsTo(User);
  models.Task.hasMany(Tag);
  models.Tag.belongsToMany(Task);
  models.Task.hasOne(TaskStatus);
  models.TaskStatus.belongsToMany(Task);
  
  return models;
};
