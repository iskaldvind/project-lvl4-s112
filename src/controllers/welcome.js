export default (router) => {
  router.get('root', '/', (ctx) => {
    console.log('root');
    console.log(ctx.session);
    ctx.render('welcome/index');
  });
};
