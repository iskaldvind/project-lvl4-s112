import buildFormObj from '../helpers/formObjectBuilder';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', {users});
    })
    .get('newUser', 'users/new', (ctx) => {
      const newUser = User.build();
      ctx.render('users/new', { f: buildFormObj(newUser) });
    })
    .post('users', '/users', async (ctx) => {
      const form = ctx.request.body.form;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('welcome'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    });
};
