import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

jasmine.addMatchers(matchers);

describe('Get data', () => {

  const server = app().listen();
  const superagent = request.agent(server);

  it('Get user', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email: 'no@no.no', firstName: 'no', lastName: 'no', password: 'nono' } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .then(async () => {
        await superagent
          .post('/sessions')
          .type('form')
          .send({ form: { email: 'no@no.no', password: 'nono' } })
          .set('user-agent', faker.internet.userAgent)
          .set('content-type', 'application/x-www-form-urlencoded')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
          .then(async () => {
            await superagent
              .get('/users/1')
              .set('user-agent', faker.internet.userAgent)
              .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
              .expect(200);
          });
      });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
