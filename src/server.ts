import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import egoTokenMiddleware from 'kfego-token-middleware';
import { get } from 'lodash';

import {reCreateSchema} from './graphql';
import connect from './services/mongo';
import generateModels from './models/generateModels';
import { egoApi } from './config';

export default async ({ ego, schemas, tags }) => {
  await connect();
  const createSchema = reCreateSchema({ models: generateModels(schemas), tags });

  const app = express();

  app.use(
    egoTokenMiddleware({
      egoURL: egoApi,
      accessRules: get(ego, 'accessRules', []),
    }),
  );

  app.use(
    '/graphql',
    bodyParser.json(),
    graphqlHTTP((err, res) => ({
      schema: createSchema(res.req.body.query.replace(/#.*\n/g, "").split("\"")[1]),
      formatError: err => {
        res.status(err.status || 500);
        return err;
      },
    })),
  );

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err: any = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: req.app.get('env') === 'development' ? err.message : {},
    });
  });

  return app;
};
