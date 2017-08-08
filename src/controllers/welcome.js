export default (router) => {
  router.get('root', '/', (ctx) => {
    console.log('root');
    console.log(Object.keys(ctx));
    console.log(ctx.session);
    ctx.render('welcome/index');
  });
};
