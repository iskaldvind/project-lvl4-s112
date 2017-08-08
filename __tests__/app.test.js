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
let server = app().listen();
jasmine.addMatchers(matchers);
let superagent = request.agent(server);
let cookie;

describe('Registration', () => {
  const email = faker.internet.email();
  const emailUpdated = faker.internet.email();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const password = faker.internet.password();

  beforeEach((done) => {
    superagent
      .post('/sessions')
      .type('form')
      .send({ form: { email: 'no@no.no', password: 'nono' } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      // .set('cookie', 'blah')
      .expect(302)
      .end((err,res) => {
        cookie = res.headers['set-cookie'];
        console.log(cookie);
        done();
      });
  });

  it('Register', async () => {
    await superagent
      .post('/users')
      .type('form')
      .send({ form: { email: 'no@no.no', firstName: 'no', lastName: 'no', password: 'nono' } })
      .set('user-agent', faker.internet.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .set('cookie', cookie)
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
      .set('cookie', cookie)
      .expect(302);
  });

  it('Get user', async () => {
    await superagent
      .get('/users/1')
      //.type('form')
      //.send('')
      .set('user-agent', faker.internet.userAgent)
      //.set('content-type', 'application/x-www-form-urlencoded')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .set('cookie', cookie)
      .expect(200);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
