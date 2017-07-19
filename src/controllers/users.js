import buildFormObj from '../helpers/formObjectBuilder';

export default (router, { User }) => {
  router
    .get('users_list', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('user_reg', '/users/new', async (ctx) => {
      const user = await User.create();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('user_save', '/users/new', async (ctx) => {
      const form = ctx.request.body.form;
      const user = await User.create(form);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('session_new'));
      } catch (e) {
        console.log(e);
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('user_profile', '/users/:id')
    .delete('user_delete', '/users/:id');
};
