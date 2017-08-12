import url from 'url';
import { buildFormObj, filterTasks, updateTags, isExist, addZeroTag } from '../helpers/dataTools';

export default (router, { Task, User, Tag, TaskStatus }) => {
  router
    .get('tasks#index', '/tasks', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const { query } = url.parse(ctx.request.url, true);
        const tasks = await filterTasks(Task, query);
        const tags = await Tag.findAll();
        const statuses = await TaskStatus.findAll();
        const users = await User.findAll();
        ctx.render('tasks', { users, tasks, statuses, tags });
      } else {
        ctx.flash.set('You must be logged in to access this page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .get('tasks#new', '/tasks/new', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const task = Task.build();
        const users = await User.findAll();
        const creatorId = ctx.state.signedId();
        const creator = await User.findById(creatorId);
        ctx.render('tasks/new', { f: buildFormObj(task), users, creator, creatorId });
      } else {
        ctx.flash.set('You must be logged in to access this page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .post('tasks#create', '/tasks', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const requestForm = ctx.request.body.form;
        const creatorId = ctx.state.signedId();
        const creator = await User.findById(creatorId);
        const formWithCreatorId = { ...requestForm, creatorId };
        const users = await User.findAll();
        const form = addZeroTag(formWithCreatorId);
        const tags = form.tags.split(' ');
        const task = Task.build(form);
        try {
          await task.save();
          await updateTags(tags, Tag, task);
          ctx.flash.set('Task has been created');
          ctx.redirect(router.url('tasks#index'));
        } catch (e) {
          ctx.render('tasks/new', { f: buildFormObj(task, e), users, creator, creatorId });
        }
      } else {
        ctx.render('errors/forbidden');
        ctx.status = 403;
      }
    })
    .get('tasks#show', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      const task = await Task.findById(taskId);
      if (!isExist(task)) {
        ctx.status = 404;
        ctx.render('errors/notFound');
      } else {
        /* eslint-disable no-lonely-if*/
        if (ctx.state.isSignedIn()) {
          const tags = await task.getTags().map(tag => tag.name);
          const status = await task.getStatus();
          const creator = await task.getCreator();
          const assignee = await task.getAssignedTo();
          ctx.render('tasks/task', { task, tags, status, creator, assignee });
        } else {
          ctx.flash.set('You must be logged in to access this page');
          ctx.redirect(router.url('sessions#new'));
        }
        /* eslint-enable no-lonely-if*/
      }
    })
    .get('tasks#edit', '/tasks/:id/edit', async (ctx) => {
      const id = Number(ctx.params.id);
      const task = await Task.findById(id);
      if (!isExist(task)) {
        ctx.status = 404;
        ctx.render('errors/notFound');
      } else {
        /* eslint-disable no-lonely-if*/
        if (ctx.state.isSignedIn()) {
          const tags = await task.getTags().map(tag => tag.name);
          const users = await User.findAll();
          const statuses = await TaskStatus.findAll();
          const status = await task.getStatus();
          const assignee = await task.getAssignedTo();
          ctx.render('tasks/edit', { f: buildFormObj(task), task, tags, users, id, statuses, status, assignee });
        } else {
          ctx.flash.set('You must be logged in to access this page');
          ctx.redirect(router.url('sessions#new'));
        }
        /* eslint-enable no-lonely-if*/
      }
    })
    .patch('tasks#update', '/tasks/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const { statusId, taskId, form } = ctx.request.body;
        const task = await Task.findById(Number(taskId));
        const id = ctx.params.id;
        try {
          task.setStatus(Number(statusId));
          const updatedForm = addZeroTag(form);
          await task.update(updatedForm);
          const tags = updatedForm.tags.split(' ');
          await updateTags(tags, Tag, task);
          ctx.flash.set('Task was sucessfully updated');
          ctx.redirect(router.url('tasks#show', id));
        } catch (e) {
          const users = await User.findAll();
          const tags = await Tag.findAll();
          ctx.render('tasks/edit', { f: buildFormObj(task, e), task, tags, users, id });
        }
      } else {
        ctx.render('errors/forbidden');
        ctx.status = 403;
      }
    })
    .delete('tasks#destroy', '/tasks/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
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
      } else {
        ctx.render('errors/forbidden');
        ctx.status = 403;
      }
    });
};
