import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import tasks from './tasks';
import errors from './errors';

const controllers = [welcome, users, sessions, tasks, errors];

export default (router, container) =>
  controllers.forEach(controller => controller(router, container));
