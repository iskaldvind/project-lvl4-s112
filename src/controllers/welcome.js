export default (router) => {
  router.get('root', '/', (ctx) => {
    console.log(ctx.state.isSignedIn());
    ctx.render('welcome/index');
  });
};
