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

  User.hasMany(Task);
  Task.belongsTo(User);
  Task.hasMany(Tag);
  Tsg.belongsToMany(Task);
  Task.hasOne(TaskStatus);
  TaskStatus.belongsToMany(Task);
  
  return models;
};
