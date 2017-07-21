import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

describe('basic requests', () => {
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

describe('user requests', () => {
  let server;
  const fantom = {};

  beforeAll(() => {
    jasmine.addMatchers(matchers);

    fantom.email = faker.internet.email();
    fantom.firstName = faker.name.firstName();
    fantom.lastName = faker.name.lastName();
    fantom.password = faker.internet.password();

    server = app().listen();
  });

  it('Register', async () => {
    const res = await request.agent(server)
      .post('/users/new')
      .type('form')
      .send({
        email: fantom.email,
        firstName: fantom.firstName,
        lastName: fantom.lastName,
        password: fantom.password,
      })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html');
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/sessions/new');
  });
  /*
  it('Log in', async () => {
    console.log('Hi');
    console.log(fantom);
    const res = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({
        email: fantom.email,
        password: fantom.password,
      })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html');
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/');
  });
  */
  afterAll((done) => {
    server.close();
    done();
  });
});
