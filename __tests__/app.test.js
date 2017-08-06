import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

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

describe('requests 2', () => {
  let server;
  const email = faker.internet.email();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const password = faker.internet.password();

  beforeAll(() => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('Register', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: { email, firstName, lastName, password } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    // console.log(res);
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/sessions/new');
  });

  it('Log in', async () => {
    const res = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email, password } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    // console.log(res);
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/sessions/new');
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
