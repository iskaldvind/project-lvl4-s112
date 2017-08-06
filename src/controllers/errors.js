export default (router) => {
  router
    .get('404', '#', (ctx) => {
      ctx.render('errors/notfound');
    })
    .get('403', '#', (ctx) => {
      ctx.render('errors/forbidden');
    });
};
