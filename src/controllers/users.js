import buildFormObj from '../helpers/formObjectBuilder';

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
      ctx.render('users/profile', { user });
    })
    .delete('user_delete', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      User.destroy({
        where: { id },
      });
      ctx.session = {};
      ctx.flash.set('Account has been deleted');
      ctx.redirect(router.url('root'));
    });
};
