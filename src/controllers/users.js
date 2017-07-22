import { buildFormObj } from '../helpers/dataTools';

export default (router, { User }) => {
  router
    .get('users_list', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('user_reg', '/users/new', async (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('user_save', '/users/new', async (ctx) => {
      const form = ctx.request.body.form;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('session_new'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('user_profile', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      const user = await User.findById(id);
      if (user === null || user.email === undefined) {
        ctx.redirect(router.url('404'));
      } else {
        ctx.render('users/profile', { user });
      }
    })
    .get('user_edit', '/users/:id/edit', async (ctx) => {
      const id = Number(ctx.params.id);
      if (id !== ctx.state.signedId()) {
        ctx.flash.set('You are not allowed to edit others\'s profiles');
        ctx.redirect(router.url('user_profile', id));
      } else {
        const user = await User.findById(id);
        ctx.render('users/edit', { f: buildFormObj(user), id });
      }
    })
    .patch('user_update', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      const form = ctx.request.body.form;
      const user = await User.findById(id);
      if (ctx.state.signedId() !== undefined && ctx.state.signedId() === id) {
        try {
          await user.update(form);
          ctx.flash.set('User profile has been updated');
          ctx.session.userName = user.fullName;
          ctx.redirect(router.url('user_profile', id));
        } catch (e) {
          ctx.render('users/edit', { f: buildFormObj(user, e), id });
        }
      } else {
        ctx.flash.set('You must log in as specified user to update account');
        ctx.render('users/profile', { f: buildFormObj(user) });
      }
    })
    .delete('user_delete', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      if (ctx.state.signedId() !== undefined && ctx.state.signedId() === id) {
        User.destroy({
          where: { id },
        });
        ctx.session = {};
        ctx.flash.set('Your account has been deleted');
        ctx.redirect(router.url('root'));
      } else {
        ctx.flash.set('You are not allowed to delete other\'s profiles');
        ctx.redirect(router.url('user_profile', id));
      }
    });
};
