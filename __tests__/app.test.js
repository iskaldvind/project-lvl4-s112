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

describe('Registration', () => {
  let server;
  const email = faker.internet.email();
  const emailUpdated = faker.internet.email();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const password = faker.internet.password();

  beforeAll(() => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('Register-Login-Logout', async () => {
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
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/');
  });

  it('Log out', async () => {
    const res = await request.agent(server)
      .delete('/sessions')
      .send('')
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/');
  });

  it('Log in again', async () => {
    const res = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email, password } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/');
  });

  it('Get users', async () => {
    const res = await request.agent(server)
      .get('/users')
      .type('form')
      .send('')
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    console.log(res.body);
    expect(res).toHaveHTTPStatus(302);
    expect(res.headers.location).toBe('/users');
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
