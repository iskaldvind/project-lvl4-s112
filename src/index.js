import 'babel-polyfill';

import path from 'path';
import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import serve from 'koa-static';
import middleware from 'koa-webpack';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import _ from 'lodash';
import methodOverride from 'koa-methodoverride';
import rollbar from 'rollbar';
import dotenv from 'dotenv';
import dateFormat from 'dateformat';
import getWebpackConfig from '../webpack.config.babel';
import addRoutes from './controllers';
import container from './container';
import { formatId } from './helpers/dataTools';

export default () => {
  const app = new Koa();

  app.keys = ['some secret hurr'];
  app.use(bodyParser());
  app.use(koaLogger());

  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method;
    }
    return '';
  }));
  app.use(serve(path.join(__dirname, '..', 'public')));

  if (process.env.NODE_ENV !== 'test') {
    app.use(middleware({
      config: getWebpackConfig(),
    }));
  }

  app.use(session(app));
  app.use(flash());

  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      signedId: () => ctx.session.userId,
      signedName: () => ctx.session.userName,
    };
    await next();
  });
  
  const router = new Router();
  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
      { formatDate: date => dateFormat(date, 'isoUtcDateTime')},
      { formatId }
    ],
  });
  pug.use(app);

  rollbar.init(process.env.ROLLBAR_TOKEN);
  app.use(rollbar.errorHandler(process.env.ROLLBAR_TOKEN));
  dotenv.config();
  return app;
};
