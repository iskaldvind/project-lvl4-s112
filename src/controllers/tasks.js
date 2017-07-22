import url from 'url';
import { buildFormObj, getTaskData, getQueryParams, filterByTag } from '../helpers/dataTools';

export default (router, { Task, User, Tag, TaskStatus }) => {
  router
    .get('tasks#index', '/tasks', async (ctx) => {
      const { query } = url.parse(ctx.request.url, true);
      const { where, tag } = await getQueryParams(query);
      const filteredTasks = await Task.findAll({ where });
      const finedTasks = await Promise.all(filteredTasks.map(async task => getTaskData(task)));
      const tasks = Object.keys(tag).length === 0 ?
        finedTasks :
        filterByTag(finedTasks, tag.tagId);
      const tags = await Tag.findAll();
      const statuses = await TaskStatus.findAll();
      const users = await User.findAll();
      ctx.render('tasks', { users, tasks, statuses, tags, f: buildFormObj(tasks) });
    })
    .get('tasks#new', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await User.findAll();
      const creatorId = ctx.state.signedId();
      const creator = await User.findById(creatorId);
      ctx.render('tasks/new', { f: buildFormObj(task), users, creator, creatorId });
    })
    .post('tasks#create', '/tasks', async (ctx) => {
      const form = ctx.request.body.form;
      form.creatorId = ctx.state.signedId();
      const users = await User.findAll();
      const creatorId = ctx.state.signedId();
      const creator = await User.findById(creatorId);
      const filledForm = form.tags !== '' ? form : { ...form, tags: '-' };
      const tags = filledForm.tags.split(' ');
      const task = Task.build(filledForm);
      try {
        await task.save();
        await tags.map(tag => Tag.findOne({ where: { name: tag } })
          .then(async result => (result ? task.addTag(result) :
            task.createTag({ name: tag }))));
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks#index'));
      } catch (e) {
        ctx.render('tasks/new', { f: buildFormObj(task, e), users, creator, creatorId });
      }
    })
    .get('tasks#show', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      const taskFull = await Task.findById(taskId);
      if (taskFull === null || taskFull.createdAt === undefined) {
        ctx.redirect(router.url('404'));
      } else {
        const task = await getTaskData(taskFull);
        const tags = task.tags;
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/task', { f: buildFormObj(task), task, tags, statuses });
      }
    })
    .patch('tasks#update', '/tasks/:id', async (ctx) => {
      const { statusId, taskId } = ctx.request.body;
      const task = await Task.findById(Number(taskId));
      task.setStatus(Number(statusId));
      ctx.flash.set('Task was sucessfully updated');
      ctx.redirect(router.url('tasks#index'));
    })
    .delete('tasks#destroy', '/tasks/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      if (ctx.state.signedId() !== undefined) {
        Task.destroy({
          where: { id },
        });
        ctx.flash.set('Task has been deleted');
        ctx.redirect(router.url('tasks#index'));
      } else {
        ctx.flash.set('You must log in to delete a task');
        ctx.redirect(router.url('sessions#create'));
      }
    });
};
