import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

const fakeUser = () => ({
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
  userAgent: faker.internet.userAgent(),
});

const fakeTask = () => ({
  name: faker.random.word(),
  description: faker.random.words(10),
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
  const { email, firstName, lastName, password, userAgent } = fakeUser();
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
  const { email, firstName, lastName, password, userAgent } = fakeUser();
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
  const user3 = fakeUser();
  const user3Edited = fakeUser();
  const user4 = fakeUser();
  const user5 = fakeUser();
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
  const user6 = fakeUser();
  const user7 = fakeUser();
  const task1 = fakeTask();
  const task1Edited = fakeTask();
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
      .set('user-agent', user6.userAgent)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Create task - Success', async () => {
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task1.name,
          tags: 'xxx',
          description: task1.description,
          assignedToId: '6',
        },
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/tasks/1')
          .set('user-agent', user6.userAgent)
          .set('x-test-auth-token', user6.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(task1.name)).toBeTruthy();
      });
  });

  it('Edit task - Success', async () => {
    await superagent
      .patch('/tasks/1')
      .type('form')
      .send({
        form:
          {
            name: task1Edited.name,
            tags: 'xxx',
            description: task1.description,
            assignedToId: '6',
            statusId: 1,
          },
        taskId: 1,
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/tasks/1')
          .set('user-agent', user6.userAgent)
          .set('x-test-auth-token', user6.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(task1Edited.name)).toBeTruthy();
      });
  });

  it('Update task status - Success', async () => {
    await superagent
      .patch('/tasks/1')
      .type('form')
      .send({
        form:
          {
            name: task1Edited.name,
            tags: 'xxx',
            description: task1.description,
            assignedToId: '6',
            statusId: 2,
          },
        taskId: 1,
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/tasks/1')
          .set('user-agent', user6.userAgent)
          .set('x-test-auth-token', user6.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes('in work')).toBeTruthy();
      });
  });

  it('Reassign task - Success', async () => {
    await superagent
      .patch('/tasks/1')
      .type('form')
      .send({
        form:
          {
            name: task1Edited.name,
            tags: 'xxx',
            description: task1.description,
            assignedToId: '7',
            statusId: 1,
          },
        taskId: 1,
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/tasks/1')
          .set('user-agent', user6.userAgent)
          .set('x-test-auth-token', user6.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes(user7.firstName)).toBeTruthy();
      });
  });

  it('Delete task - Success', async () => {
    await superagent
      .delete('/tasks/1')
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302)
      .then(async () => {
        const response = await superagent
          .get('/tasks')
          .set('user-agent', user6.userAgent)
          .set('x-test-auth-token', user6.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        expect(response).toHaveHTTPStatus(200);
        expect(response.text.includes('000001')).toBeFalsy();
      });
  });

  afterAll((done) => {
    server.close();
    done();
  });
});


describe('Tasks Filtration', () => {
  const user8 = fakeUser();
  const user9 = fakeUser();
  const task2 = fakeTask();
  const task3 = fakeTask();
  const task4 = fakeTask();
  const server = app().listen();
  const superagent = request.agent(server);

  beforeAll(async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user8.email,
          firstName: user8.firstName,
          lastName: user8.lastName,
          password: user8.password,
        },
      })
      .set('user-agent', user8.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    await superagent
      .post('/users')
      .type('form')
      .send({ form:
        {
          email: user9.email,
          firstName: user9.firstName,
          lastName: user9.lastName,
          password: user9.password,
        },
      })
      .set('user-agent', user9.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task2.name,
          tags: 'aaa bbb',
          description: task2.description,
          assignedToId: '8',
        },
      })
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task3.name,
          tags: 'bbb ccc',
          description: task3.description,
          assignedToId: '9',
        },
      })
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task4.name,
          tags: 'ddd',
          description: task4.description,
          assignedToId: '9',
        },
      })
      .set('user-agent', user9.userAgent)
      .set('x-test-auth-token', user9.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .then(async () => {
        await superagent
          .patch('/tasks/4')
          .type('form')
          .send({
            form:
              {
                name: task4.name,
                tags: 'ddd',
                description: task4.description,
                assignedToId: '9',
                statusId: 3,
              },
            taskId: 4,
          })
          .set('user-agent', user9.userAgent)
          .set('x-test-auth-token', user9.email)
          .set('Connection', 'keep-alive')
          .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
      });
  });

  it('Filter: "Opened by me"', async () => {
    const response = await superagent
      .get('/tasks?creatorId=8')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeTruthy();
    expect(response.text.includes('000003')).toBeTruthy();
    expect(response.text.includes('000004')).toBeFalsy();
  });

  it('Filter: "Assigned to me"', async () => {
    const response = await superagent
      .get('/tasks?assignedToId=8')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeTruthy();
    expect(response.text.includes('000003')).toBeFalsy();
    expect(response.text.includes('000004')).toBeFalsy();
  });

  it('Filter: by tag', async () => {
    const response = await superagent
      .get('/tasks?tagId=3&statusId=All+statuses&assignedToId=All+assignee')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeTruthy();
    expect(response.text.includes('000003')).toBeTruthy();
    expect(response.text.includes('000004')).toBeFalsy();
  });

  it('Filter: by status', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=3&assignedToId=All+assignee')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeFalsy();
    expect(response.text.includes('000003')).toBeFalsy();
    expect(response.text.includes('000004')).toBeTruthy();
  });

  it('Filter: by assignee', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=All+statuses&assignedToId=9')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeFalsy();
    expect(response.text.includes('000003')).toBeTruthy();
    expect(response.text.includes('000004')).toBeTruthy();
  });

  it('Filter contradictory', async () => {
    const response = await superagent
      .get('/tasks?tagId=2&statusId=4&assignedToId=9')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeFalsy();
    expect(response.text.includes('000003')).toBeFalsy();
    expect(response.text.includes('000004')).toBeFalsy();
  });

  it('Filter all', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=All+statuses&assignedToId=All+assignee')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000002')).toBeTruthy();
    expect(response.text.includes('000003')).toBeTruthy();
    expect(response.text.includes('000004')).toBeTruthy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
