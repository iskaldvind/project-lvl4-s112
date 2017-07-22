import url from 'url';
import { buildFormObj, getTaskData, getQueryParams } from '../helpers/dataTools';

export default (router, { Task, User, Tag, TaskStatus }) => {
  router
    .get('tasks_list', '/tasks', async (ctx) => {
      const { query } = url.parse(ctx.request.url, true);
      const where = await getQueryParams(query);
      const filteredTasks = await Task.findAll({ where });
      const tasks = await Promise.all(filteredTasks.map(async task => getTaskData(task)));
      const tags = await Tag.findAll();
      const statuses = await TaskStatus.findAll();
      const users = await User.findAll();
      ctx.render('tasks', { users, tasks, statuses, tags });
    })
    .get('task_reg', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await User.findAll();
      ctx.render('tasks/new', { f: buildFormObj(task), users });
    })
    .post('task_save', '/tasks/new', async (ctx) => {
      const form = ctx.request.body.form;
      form.creatorId = ctx.state.signedId();
      const users = await User.findAll();
      const tags = form.tags.split(' ');
      const task = Task.build(form);
      try {
        await task.save();
        await tags.map(tag => Tag.findOne({ where: { name: tag } })
          .then(async result => (result ? task.addTag(result) :
            task.createTag({ name: tag }))));
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks_list'));
      } catch (e) {
        ctx.render('tasks/new', { f: buildFormObj(user, e), users });
      }
    })
    .get('task', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      const taskFull = await Task.findById(taskId);
      const task = await getTaskData(taskFull);
      const tags = task.tags;
      const statuses = await TaskStatus.findAll();
      ctx.render('tasks/task', { task, tags, statuses });
    })
    /*
    .get('user_edit', '/users/:id/edit', async (ctx) => {
      const id = Number(ctx.params.id);
      const user = await User.findById(id);
      ctx.render('users/edit', { f: buildFormObj(user), id });
    })
    .patch('user_update', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      const form = ctx.request.body.form;
      const user = await User.findById(id);
      if (ctx.state.signedId() !== undefined && ctx.state.signedId() === id) {
        try {
          await user.update(form);
          ctx.flash.set('User profile has been updated');
          ctx.session.userName = user.fullName();
          ctx.render('users/profile', { user });
        } catch (e) {
          ctx.flash.set('Something bad have happened');
          ctx.render('users/profile', { f: buildFormObj(user, e) });
        }
      } else {
        ctx.flash.set('You must log in as specified user to update account');
        ctx.render('users/profile', { f: buildFormObj(user) });
      }
    })*/
    .delete('task_delete', '/tasks/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      if (ctx.state.signedId() !== undefined) {
        try {
          Task.destroy({
            where: { id },
          });
          ctx.flash.set('Task has been deleted');
          ctx.redirect(router.url('task_list'));
        } catch (e) {
          ctx.flash.set('Task not found');
          ctx.render('tasks/task', { f: buildFormObj(task, e) });
        }
      } else {
        ctx.flash.set('You must log in to delete a task');
        ctx.redirect(router.url('sessions_enter'));
      }
    });
    /*
    */
};
