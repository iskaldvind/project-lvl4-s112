import welcome from './welcome';
import users from './users';

const controllers = [welcome, users];

export default (router, container) => controllers.forEach(f => f(router, container));
