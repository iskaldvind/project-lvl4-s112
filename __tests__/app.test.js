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

describe('Self profile manipulations', () => {
  const user3 = fake();
  const user3Edited = fake();
  const user4 = fake();
  const server = app().listen();
  const superagent = request.agent(server);

  beforeAll(async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user3.email,
          firstName: user3.firstName,
          lastName: user3.lastName,
          password: user3.password,
        },
      })
      .set('user-agent', user3.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user4.email,
          firstName: user4.firstName,
          lastName: user4.lastName,
          password: user4.password,
        },
      })
      .set('user-agent', user4.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
  });

  it('Read profile', async () => {
    await superagent
      .get('/users/3')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(200)
      .expect(res => res.text.includes(user3.firstName));
  });

  it('Edit self profile', async () => {
    await superagent
      .patch('/users/3')
      .type('form')
      .send({ form:
        {
          email: user3.email,
          firstName: user3Edited.firstName,
          lastName: user3.lastName,
          password: user3.password,
        },
      })
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        await superagent
          .get('/users/1')
          .set('user-agent', user3.userAgent)
          .set('x-test-auth-token', user3.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
          .expect(200)
          .expect(res => res.text.includes(user3Edited.firstName));
      });
  });

  it('Delete self profile', async () => {
    await superagent
      .delete('/users/3')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        await superagent
          .get('/users')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
          .expect(200)
          .expect(res => !res.text.includes(user3Edited.firstName));
      });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
