import buildFormObj from '../helpers/formObjectBuilder';
import encrypt from '../helpers/secure';

export default (router, { User }) => {
  router
    .get('session_new', '/sessions/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session_enter', '/sessions', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }

      ctx.flash.set('email or password were wrong');
      ctx.render('sessions/new', { f: buildFormObj({ email }) });
    })
    .delete('session_exit', '/session', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
