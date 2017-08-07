export default (router) => {
  router.get('root', '/', (ctx) => {
    console.log('ROOOOOOOOT');
    console.log(ctx.state);
    console.log(ctx.state.isSignedIn());
    ctx.render('welcome/index');
  });
};
