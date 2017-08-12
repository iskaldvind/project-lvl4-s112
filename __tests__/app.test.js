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

  it('Register - Success', async () => {
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

  it('Login-Logout - Success', async () => {
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

describe('Users CRUD', () => {
  const user3 = fake();
  const user3Edited = fake();
  const user4 = fake();
  const user5 = fake();
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
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user5.email,
          firstName: user5.firstName,
          lastName: user5.lastName,
          password: user5.password,
        },
      })
      .set('user-agent', user5.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
  });

  it('Read users list while loged in - Success', async () => {
    const response = await superagent
      .get('/users')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3.firstName)).toBeTruthy();
  });

  it('Read users list while not loged in - Fail', async () => {
    const response = await superagent
      .get('/users')
      .set('user-agent', user3.userAgent)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Read own profile - Success', async () => {
    const response = await superagent
      .get('/users/3')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3.firstName)).toBeTruthy();
  });

  it('Edit own profile - Success', async () => {
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
        const response = await superagent
          .get('/users/3')
          .set('user-agent', user3.userAgent)
          .set('x-test-auth-token', user3.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user3Edited.firstName)).toBeTruthy();
      });
  });

  it('Delete own profile - Success', async () => {
    await superagent
      .delete('/users/3')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/users')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user3Edited.firstName)).toBeFalsy();
      });
  });

  it('Read other\'s profile while loged in - Success', async () => {
    const response = await superagent
      .get('/users/5')
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user5.firstName)).toBeTruthy();
  });

  it('Read other\'s profile while not loged in - Fail', async () => {
    const response = await superagent
      .get('/users/5')
      .set('user-agent', user4.userAgent)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Edit other\'s profile - Fail', async () => {
    await superagent
      .patch('/users/5')
      .type('form')
      .send({ form:
        {
          email: user5.email,
          firstName: user3Edited.firstName,
          lastName: user5.lastName,
          password: user5.password,
        },
      })
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/users/5')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user3Edited.firstName)).toBeFalsy();
      });
  });

  it('Delete other\'s profile - Fail', async () => {
    await superagent
      .delete('/users/5')
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/users/5')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user5.firstName)).toBeTruthy();
      });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tasks CRUD', () => {
  const user6 = fake();
  const user7 = fake();
  const server = app().listen();
  const superagent = request.agent(server);

  beforeAll(async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user6.email,
          firstName: user6.firstName,
          lastName: user6.lastName,
          password: user6.password,
        },
      })
      .set('user-agent', user6.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user7.email,
          firstName: user7.firstName,
          lastName: user7.lastName,
          password: user7.password,
        },
      })
      .set('user-agent', user7.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
  });

  it('Read tasks list while loged in - Success', async () => {
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('Task')).toBeTruthy();
  });

  it('Read tasks list while not loged in - Fail', async () => {
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user7.userAgent)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Create task - Success', async () => {
    const response = await superagent
      .post('/tasks')
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
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3.firstName)).toBeTruthy();
  });
const o = `
  it('Edit own profile - Success', async () => {
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
        const response = await superagent
          .get('/users/3')
          .set('user-agent', user3.userAgent)
          .set('x-test-auth-token', user3.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user3Edited.firstName)).toBeTruthy();
      });
  });

  it('Delete own profile - Success', async () => {
    await superagent
      .delete('/users/3')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/users')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user3Edited.firstName)).toBeFalsy();
      });
  });

  it('Read other\'s profile while loged in - Success', async () => {
    const response = await superagent
      .get('/users/5')
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user5.firstName)).toBeTruthy();
  });

  it('Read other\'s profile while not loged in - Fail', async () => {
    const response = await superagent
      .get('/users/5')
      .set('user-agent', user4.userAgent)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Edit other\'s profile - Fail', async () => {
    await superagent
      .patch('/users/5')
      .type('form')
      .send({ form:
        {
          email: user5.email,
          firstName: user3Edited.firstName,
          lastName: user5.lastName,
          password: user5.password,
        },
      })
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/users/5')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user3Edited.firstName)).toBeFalsy();
      });
  });

  it('Delete other\'s profile - Fail', async () => {
    await superagent
      .delete('/users/5')
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/users/5')
          .set('user-agent', user4.userAgent)
          .set('x-test-auth-token', user4.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user5.firstName)).toBeTruthy();
      });
  });
`;
  afterAll((done) => {
    server.close();
    done();
  });
});