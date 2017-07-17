export default (router) => {
  router
    .get('welcome', '/', (ctx) => {
      ctx.render('welcome/index');
    });
};
