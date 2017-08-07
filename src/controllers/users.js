import { buildFormObj, isExist } from '../helpers/dataTools';

export default (router, { User }) => {
  router
    .get('users#index', '/users', async (ctx) => {
      console.log(`====> ctx state issignedin => ${ctx.state.isSignedIn()}`);
      console.log(`====> ctx session userid => ${ctx.session.userId}`);
      console.log('Users#index:ctx-------------------------------');
      console.log(ctx);
      console.log('Users#index:ctx.request=======================');
      console.log(ctx.request);
      console.log('Users#index:ctx.request.body!!!!!!!!!!!!!!!!!!');
      console.log(ctx.request.body);
      console.log('Users#index:ctx.request.body.form#############');
      console.log(ctx.request.body.form);
      console.log('Users#index:end@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      console.log(ctx.session);
      if (ctx.state.isSignedIn()) {
        console.log('====> is signed in');
        const users = await User.findAll();
        ctx.render('users', { users });
      } else {
        console.log('====> is not signed in');
        ctx.flash.set('You must be logged in to access this page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .get('users#new', '/users/new', async (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users#create', '/users', async (ctx) => {
      const form = ctx.request.body.form;
      console.log('Users#create:ctx-------------------------------');
      console.log(ctx);
      console.log('Users#create:ctx.request=======================');
      console.log(ctx.request);
      console.log('Users#create:ctx.request.body!!!!!!!!!!!!!!!!!!');
      console.log(ctx.request.body);
      console.log('Users#create:ctx.request.body.form#############');
      console.log(ctx.request.body.form);
      console.log('Users#create:end@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      console.log(ctx.session);
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set('You have been successfully registered');
        ctx.redirect(router.url('sessions#new'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('users#show', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      const isOwner = id === ctx.state.signedId();
      const user = await User.findById(id);
      if (!isExist(user)) {
        ctx.render('errors/notFound');
        ctx.status = 404;
      } else {
        /* eslint-disable no-lonely-if*/
        if (ctx.state.isSignedIn()) {
          ctx.render('users/profile', { user, isOwner });
        } else {
          ctx.flash.set('You must be logged in to access this page');
          ctx.redirect(router.url('sessions#new'));
        }
        /* eslint-enable no-lonely-if*/
      }
    })
    .get('users#edit', '/users/:id/edit', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const id = Number(ctx.params.id);
        if (id !== ctx.state.signedId()) {
          ctx.flash.set('You are not allowed to edit others\'s profiles');
          ctx.redirect(router.url('users#show', id));
        } else {
          const user = await User.findById(id);
          ctx.render('users/edit', { f: buildFormObj(user), id });
        }
      } else {
        ctx.flash.set('You must be logged in to access this page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .patch('users#update', '/users/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const id = Number(ctx.params.id);
        const form = ctx.request.body.form;
        const user = await User.findById(id);
        if (ctx.state.isSignedIn() && ctx.state.signedId() === id) {
          try {
            await user.update(form);
            ctx.flash.set('User profile has been updated');
            ctx.session.userName = user.fullName;
            ctx.redirect(router.url('users#show', id));
          } catch (e) {
            ctx.render('users/edit', { f: buildFormObj(user, e), id });
          }
        } else {
          ctx.flash.set('You must log in as specified user to update account');
          ctx.render('users/profile', { f: buildFormObj(user) });
        }
      } else {
        ctx.render('errors/forbidden');
        ctx.status = 403;
      }
    })
    .delete('users#destroy', '/users/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const id = Number(ctx.params.id);
        if (ctx.state.isSignedIn() && ctx.state.signedId() === id) {
          User.destroy({
            where: { id },
          });
          ctx.session = {};
          ctx.flash.set('Your account has been deleted');
          ctx.redirect(router.url('root'));
        } else {
          ctx.flash.set('You are not allowed to delete other\'s profiles');
          ctx.redirect(router.url('users#show', id));
        }
      } else {
        ctx.render('errors/forbidden');
        ctx.status = 403;
      }
    });
};
