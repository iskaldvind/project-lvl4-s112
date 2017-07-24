import url from 'url';
import { buildFormObj, getTaskData, filterTasks, createTags, isExist } from '../helpers/dataTools';

export default (router, { Task, User, Tag, TaskStatus }) => {
  router
    .get('tasks#index', '/tasks', async (ctx) => {
      const { query } = url.parse(ctx.request.url, true);
      const tasks = await filterTasks(Task, query);
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
      const requestForm = ctx.request.body.form;
      const creatorId = ctx.state.signedId();
      const creator = await User.findById(creatorId);
      const formWithCreatorId = { ...requestForm, creatorId };
      const users = await User.findAll();
      const form = formWithCreatorId.tags !== '' ? formWithCreatorId : { ...formWithCreatorId, tags: '-' };
      const tags = form.tags.split(' ');
      const task = Task.build(form);
      try {
        await task.save();
        await createTags(tags, Tag, task);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks#index'));
      } catch (e) {
        ctx.render('tasks/new', { f: buildFormObj(task, e), users, creator, creatorId });
      }
    })
    .get('tasks#show', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      const requestedTask = await Task.findById(taskId);
      if (!isExist(requestedTask)) {
        ctx.redirect(router.url('404'));
      } else {
        const task = await getTaskData(requestedTask);
        const tags = task.tags;
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/task', { f: buildFormObj(task), task, tags, statuses });
      }
    })
    .get('tasks#edit', '/tasks/:id/edit', async (ctx) => {
      const id = Number(ctx.params.id);
      const requestedTask = await Task.findById(id);
      if (!isExist(requestedTask)) {
        ctx.redirect(router.url('404'));
      } else {
        const task = await getTaskData(requestedTask);
        const tags = (task.tags).filter(tag => tag !== '-').join(' ');
        const users = await User.findAll();
        const k = buildFormObj(task);
        console.log('&&&&&&&&&');
        console.log(k.object.description);
        console.log(k.object.assignedTo);
        console.log(k.object.assignedToId);
        ctx.render('tasks/edit', { f: buildFormObj(task), task, tags, users, id });
      }
    })
    .patch('tasks#update', '/tasks/:id', async (ctx) => {
      const { statusId, taskId, form } = ctx.request.body;
      const task = await Task.findById(Number(taskId));
      try {
        task.setStatus(Number(statusId));
        await task.update(form);
        ctx.flash.set('Task was sucessfully updated');
        ctx.redirect(router.url('tasks#index'));
      } catch (e) {
        const users = await User.findAll();
        ctx.render('tasks/edit', { f: buildFormObj(user, e), task, tags, users, id });
      }
    })
    .delete('tasks#destroy', '/tasks/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      if (ctx.state.isSignedIn()) {
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
