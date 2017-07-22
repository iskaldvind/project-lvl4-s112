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
      ctx.render('tasks/task', { f: buildFormObj(task), task, tags, statuses });
    })
    .patch('task_update', '/tasks/:id', async (ctx) => {
      const { statusId, taskId } = ctx.request.body;
      const task = Task.findById(Number(taskId));
      task.setTaskStatus(Number(statusId));
      ctx.flash.set('Task was sucessfully updated');
      ctx.redirect(router.url('tasks_list'));
      const user = await User.findById(id);
    })
    .delete('task_delete', '/tasks/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      if (ctx.state.signedId() !== undefined) {
        try {
          Task.destroy({
            where: { id },
          });
          ctx.flash.set('Task has been deleted');
          ctx.redirect(router.url('tasks_list'));
        } catch (e) {
          ctx.flash.set('Task not found');
          ctx.render('tasks/task', { f: buildFormObj(task, e) });
        }
      } else {
        ctx.flash.set('You must log in to delete a task');
        ctx.redirect(router.url('sessions_enter'));
      }
    });
};