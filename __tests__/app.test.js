import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

const fakeUser = id => ({
  id,
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
  userAgent: faker.internet.userAgent(),
});

const fakeTask = id => ({
  id,
  name: faker.random.word(),
  description: faker.random.words(10),
});

jasmine.addMatchers(matchers);

describe('Simple requests', () => {
  const server = app().listen();

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
  const { email, firstName, lastName, password, userAgent } = fakeUser(1);
  const server = app().listen();
  const superagent = request.agent(server);

  it('Register - Success', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email, firstName, lastName, password } })
      .set('user-agent', userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Authentication', () => {
  const { email, firstName, lastName, password, userAgent } = fakeUser(2);
  const server = app().listen();
  const superagent = request.agent(server);

  it('Login-Logout - Success', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email, firstName, lastName, password } })
      .set('user-agent', userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/sessions')
      .type('form')
      .send({ form: { email, password } })
      .set('user-agent', userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
    await superagent
      .delete('/sessions')
      .set('user-agent', userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Users CRUD', () => {
  const user3 = fakeUser(3);
  const user3Edited = fakeUser(3);
  const user4 = fakeUser(4);
  const user5 = fakeUser(5);
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
      .set('content-type', 'application/x-www-form-urlencoded');
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
      .set('content-type', 'application/x-www-form-urlencoded');
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
      .set('content-type', 'application/x-www-form-urlencoded');
  });

  it('Read users list while loged in - Success', async () => {
    const response = await superagent
      .get('/users')
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3.firstName)).toBeTruthy();
  });

  it('Read users list while not loged in - Fail', async () => {
    const response = await superagent
      .get('/users')
      .set('user-agent', user3.userAgent)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Read own profile - Success', async () => {
    const response = await superagent
      .get(`/users/${user3.id}`)
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3.firstName)).toBeTruthy();
  });

  it('Edit own profile - Success', async () => {
    await superagent
      .patch(`/users/${user3.id}`)
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
      .expect(302);
    const response = await superagent
      .get(`/users/${user3.id}`)
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3Edited.firstName)).toBeTruthy();
  });

  it('Delete own profile - Success', async () => {
    await superagent
      .delete(`/users/${user3.id}`)
      .set('user-agent', user3.userAgent)
      .set('x-test-auth-token', user3.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get('/users')
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3Edited.firstName)).toBeFalsy();
  });

  it('Read other\'s profile while loged in - Success', async () => {
    const response = await superagent
      .get(`/users/${user5.id}`)
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user5.firstName)).toBeTruthy();
  });

  it('Read other\'s profile while not loged in - Fail', async () => {
    const response = await superagent
      .get(`/users/${user5.id}`)
      .set('user-agent', user4.userAgent)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Edit other\'s profile - Fail', async () => {
    await superagent
      .patch(`/users/${user5.id}`)
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
      .expect(302);
    const response = await superagent
      .get(`/users/${user5.id}`)
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user3Edited.firstName)).toBeFalsy();
  });

  it('Delete other\'s profile - Fail', async () => {
    await superagent
      .delete(`/users/${user5.id}`)
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/users/${user5.id}`)
      .set('user-agent', user4.userAgent)
      .set('x-test-auth-token', user4.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user5.firstName)).toBeTruthy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tasks CRUD', () => {
  const user6 = fakeUser(6);
  const user7 = fakeUser(7);
  const task1 = fakeTask(1);
  const task1Edited = fakeTask(1);
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
      .set('content-type', 'application/x-www-form-urlencoded');
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
      .set('content-type', 'application/x-www-form-urlencoded');
  });

  it('Read tasks list while loged in - Success', async () => {
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('Task')).toBeTruthy();
  });

  it('Read tasks list while not loged in - Fail', async () => {
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user6.userAgent)
      .set('Connection', 'keep-alive');
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
          assignedToId: user6.id,
        },
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task1.id}`)
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task1.name)).toBeTruthy();
  });

  it('Edit task - Success', async () => {
    await superagent
      .patch(`/tasks/${task1.id}`)
      .type('form')
      .send({
        form:
          {
            name: task1Edited.name,
            tags: 'xxx',
            description: task1.description,
            assignedToId: user6.id,
            statusId: 1,
          },
        taskId: task1.id,
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task1.id}`)
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task1Edited.name)).toBeTruthy();
  });

  it('Update task status - Success', async () => {
    await superagent
      .patch(`/tasks/${task1.id}`)
      .type('form')
      .send({
        form:
          {
            name: task1Edited.name,
            tags: 'xxx',
            description: task1.description,
            assignedToId: user6.id,
            statusId: 2,
          },
        taskId: task1.id,
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task1.id}`)
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('in work')).toBeTruthy();
  });

  it('Reassign task - Success', async () => {
    await superagent
      .patch(`/tasks/${task1.id}`)
      .type('form')
      .send({
        form:
          {
            name: task1Edited.name,
            tags: 'xxx',
            description: task1.description,
            assignedToId: user7.id,
            statusId: 1,
          },
        taskId: task1.id,
      })
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task1.id}`)
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user7.firstName)).toBeTruthy();
  });

  it('Delete task - Success', async () => {
    await superagent
      .delete(`/tasks/${task1.id}`)
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user6.userAgent)
      .set('x-test-auth-token', user6.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('000001')).toBeFalsy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});

describe('Tasks Filtration', () => {
  const user8 = fakeUser(8);
  const user9 = fakeUser(9);
  const task2 = fakeTask(2);
  const task3 = fakeTask(3);
  const task4 = fakeTask(4);
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
      .set('content-type', 'application/x-www-form-urlencoded');
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
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task2.name,
          tags: 'aaa bbb',
          description: task2.description,
          assignedToId: user8.id,
        },
      })
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task3.name,
          tags: 'bbb ccc',
          description: task3.description,
          assignedToId: user9.id,
        },
      })
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    await superagent
      .post('/tasks')
      .type('form')
      .send({ form:
        {
          name: task4.name,
          tags: 'ddd',
          description: task4.description,
          assignedToId: user9.id,
        },
      })
      .set('user-agent', user9.userAgent)
      .set('x-test-auth-token', user9.email)
      .set('Connection', 'keep-alive');
    await superagent
      .patch(`/tasks/${task4.id}`)
      .type('form')
      .send({
        form:
          {
            name: task4.name,
            tags: 'ddd',
            description: task4.description,
            assignedToId: user9.id,
            statusId: 3,
          },
        taskId: task4.id,
      })
      .set('user-agent', user9.userAgent)
      .set('x-test-auth-token', user9.email)
      .set('Connection', 'keep-alive');
  });

  it('Filter: "Opened by me"', async () => {
    const response = await superagent
      .get(`/tasks?creatorId=${user8.id}`)
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task3.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task4.id}`)).toBeFalsy();
  });

  it('Filter: "Assigned to me"', async () => {
    const response = await superagent
      .get(`/tasks?assignedToId=${user8.id}`)
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task3.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task4.id}`)).toBeFalsy();
  });

  it('Filter: by tag', async () => {
    const response = await superagent
      .get('/tasks?tagId=3&statusId=All+statuses&assignedToId=All+assignee')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task3.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task4.id}`)).toBeFalsy();
  });

  it('Filter: by status', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=3&assignedToId=All+assignee')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task3.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task4.id}`)).toBeTruthy();
  });

  it('Filter: by assignee', async () => {
    const response = await superagent
      .get(`/tasks?tagId=All+tags&statusId=All+statuses&assignedToId=${user9.id}`)
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task3.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task4.id}`)).toBeTruthy();
  });

  it('Filter contradictory', async () => {
    const response = await superagent
      .get(`/tasks?tagId=2&statusId=4&assignedToId=${user9.id}`)
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task3.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task4.id}`)).toBeFalsy();
  });

  it('Filter all', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=All+statuses&assignedToId=All+assignee')
      .set('user-agent', user8.userAgent)
      .set('x-test-auth-token', user8.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task3.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task4.id}`)).toBeTruthy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
