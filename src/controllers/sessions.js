import { buildFormObj } from '../helpers/dataTools';
import encrypt from '../helpers/secure';

export default (router, { User }) => {
  router
    .get('session_new', '/sessions/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session_enter', '/sessions', async (ctx) => {
      console.log(ctx.request);
      console.log('WAT???');
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.session.userName = user.fullName;
        ctx.redirect(router.url('root'));
      } else {
        ctx.flash.set('email or password were wrong');
        ctx.redirect(router.url('session_new'));
      }
    })
    .delete('session_exit', '/sessions', (ctx) => {
      console.log('HI!!!');
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
