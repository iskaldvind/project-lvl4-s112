import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';
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
  let server;
  let superagent;
  const email = faker.internet.email();
  const emailUpdated = faker.internet.email();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const password = faker.internet.password();

  beforeAll(() => {
    jasmine.addMatchers(matchers);
    server = app().listen();
    superagent = request.agent(server);
  });

  it('Register', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email: 'no@no.no', firstName: 'no', lastName: 'no', password: 'nono' } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .set('cookie', 'koa.sid.sig=LHIYxkYS8LBHnP5USwZiExMwSaI; _ga=GA1.3.2006899796.1500299175; _gid=GA1.3.712511141.1502095427')
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
      .set('cookie', 'koa.sid=LSg6TJrCGOwtxV3GnAsmtu94JNcj5ITh; koa.sid.sig=fiF4QN6nxuiIIvngsQVoogtPRsA; _ga=GA1.3.2006899796.1500299175; _gid=GA1.3.1190983512.1502095434')
      .expect(302);
  });

  it('Get user', async () => {
    await superagent
      .get('/users/1')
      .type('form')
      .send('')
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .set('cookie', 'koa.sid=LSg6TJrCGOwtxV3GnAsmtu94JNcj5ITh; koa.sid.sig=fiF4QN6nxuiIIvngsQVoogtPRsA; _ga=GA1.3.2006899796.1500299175; _gid=GA1.3.1998091839.1502095444')
      .expect(200);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
