import { buildFormObj } from '../helpers/dataTools';
import encrypt from '../helpers/secure';

export default (router, { User }) => {
  router
    .get('sessions#new', '/sessions/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('sessions#create', '/sessions', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      console.log('sessions#create:ctx-------------------------------');
      console.log(ctx);
      console.log('sessions#create:ctx.reqquest======================');
      console.log(ctx.request);
      console.log('sessions#create:ctx.request.body!!!!!!!!!!!!!!!!!!');
      console.log(ctx.request.body);
      console.log('sessions#create:ctx.request.body.form#############');
      console.log(ctx.request.body.form);
      console.log('sessions#create:end@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      console.log(ctx.session);
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.session.userName = user.fullName;
        console.log('your id is: ');
        console.log(ctx.session.userId);
        console.log('your name is: ');
        console.log(ctx.session.userName);
        console.log(ctx.state.isSignedIn());
        ctx.redirect(router.url('root'));
      } else {
        ctx.flash.set('email or password were wrong');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .delete('sessions#destroy', '/sessions', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
