export default (router) => {
  router.get('404', '/404', (ctx) => {
    ctx.render('errors/notfound');
  });
};
