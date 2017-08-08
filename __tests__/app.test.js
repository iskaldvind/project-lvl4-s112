import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

jasmine.addMatchers(matchers);
/*
describe('requests', () => {
  let server;

  beforeAll(() => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
*/

describe('Registration', () => {
  const email = faker.internet.email();
  const emailUpdated = faker.internet.email();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const password = faker.internet.password();

  const server = app().listen();
  const superagent = request.agent(server);

  it('Register', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email: 'no@no.no', firstName: 'no', lastName: 'no', password: 'nono' } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302);
  });

  it('Log in', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({ form: { email: 'no@no.no', password: 'nono' } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302);
  });

  it('Log out', async () => {
    await superagent
      .delete('/sessions')
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

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
