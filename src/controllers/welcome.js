export default (router) => {
  router.get('root', '/', (ctx) => {
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    console.log(ctx.session);
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    ctx.render('welcome/index');
  });
};
