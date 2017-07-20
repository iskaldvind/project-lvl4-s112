import getUser from './User';
import getTag from './Tag';
import getTask from './Task';
import getTaskStatus from './TaskStatus';

export default connect => ({
  User: getUser(connect),
  Tag: getTag(connect),
  Task: getTask(connect),
  TaskStatus: getTaskStatus(connect),
});
