import buildFormObj from '../helpers/formObjectBuilder';
import encrypt from '../helpers/secure';

export default (router, { User }) => {
  router
    .get('session_new', '/sessions/new', async (ctx) => {
      // console.log('session_new');
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session_enter', '/sessions', async (ctx) => {
      // console.log('session_enter');
      const { email, password } = ctx.request.body.form;
      // console.log(`email password: ${email} ${password}`);
      const user = await User.findOne({
        where: {
          email,
        },
      });
      // console.log(`user: ${user}`);
      if (user && user.passwordDigest === encrypt(password)) {
        // console.log('session valid');
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
      } else {
        // console.log('session not valid');
        ctx.flash.set('email or password were wrong');
        ctx.redirect(router.url('session_new'));
      }
    })
    .delete('session_exit', '/sessions', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
