import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

const fake = () => ({
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
  userAgent: faker.internet.userAgent(),
});

jasmine.addMatchers(matchers);

describe('Simple requests', () => {
  const server = app().listen();

  beforeAll(() => {
    jasmine.addMatchers(matchers);
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

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Registration', () => {
  const { email, firstName, lastName, password, userAgent } = fake();
  const server = app().listen();
  const superagent = request.agent(server);

  it('Register', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email, firstName, lastName, password } })
      .set('user-agent', userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Authentication', () => {
  const { email, firstName, lastName, password, userAgent } = fake();
  const server = app().listen();
  const superagent = request.agent(server);

  it('Login-Logout', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email, firstName, lastName, password } })
      .set('user-agent', userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .then(async () => {
        await superagent
          .post('/sessions')
          .type('form')
          .send({ form: { email, password } })
          .set('user-agent', userAgent)
          .set('content-type', 'application/x-www-form-urlencoded')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
          .expect(302)
          .then(async () => {
            await superagent
              .delete('/sessions')
              .set('user-agent', userAgent)
              .set('content-type', 'application/x-www-form-urlencoded')
              .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
              .expect(302);
          });
      });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Get data', () => {
  const { email, firstName, lastName, password, userAgent } = fake();
  const server = app().listen();
  let cookie;
  const superagent = request.agent(server);

  it('Get user', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email, firstName, lastName, password } })
      .set('user-agent', userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .then(async (res) => {
        cookie = res.headers['set-cookie'];
        await superagent
          .post('/sessions')
          .type('form')
          .send({ form: { email, password } })
          .set('user-agent', userAgent)
          .set('x-test-auth-token', email)
          .set('Connection', 'keep-alive')
          .set('content-type', 'application/x-www-form-urlencoded')
          .set('cookie', cookie)
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
          .then(async () => {
            await superagent
              .get('/users/1')
              .set('user-agent', userAgent)
              .set('x-test-auth-token', email)
              .set('Connection', 'keep-alive')
              .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
              .set('cookie', cookie)
              .expect(200);
          });
      });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
