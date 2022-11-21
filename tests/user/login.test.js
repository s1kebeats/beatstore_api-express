import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('User login', () => {
  it('Only POST', async () => {
    const res = await request(app).get('/api/login');
    assert.equal(res.statusCode, 404);
  });
  it('No login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        password: 'randompassword',
      })
    assert.equal(res.statusCode, 400);
  });
  it('No password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'random@email.com',
      })
    assert.equal(res.statusCode, 400);
  });
  it('Login with username', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.body.accessToken, 'string');
    assert.equal(typeof res.body.refreshToken, 'string');
    assert.equal(res.body.user.username, 's1kebeats');
    assert.equal(res.body.user.email, 'adacenkoboos@gmail.com');
    // refresh token cookie check
    assert.equal(
      res.headers['set-cookie'][0].includes(
        'refreshToken=' + res.body.refreshToken
      ),
      true
    );
    assert.equal(res.headers['set-cookie'][0].includes('HttpOnly'), true);
  });
  it('Login with email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'adacenkoboos@gmail.com',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.body.accessToken, 'string');
    assert.equal(typeof res.body.refreshToken, 'string');
    assert.equal(res.body.user.username, 's1kebeats');
    assert.equal(res.body.user.email, 'adacenkoboos@gmail.com');
    // refresh token cookie check
    assert.equal(
      res.headers['set-cookie'][0].includes(res.body.refreshToken),
      true
    );
    assert.equal(res.headers['set-cookie'][0].includes('HttpOnly'), true);
  });
  it('Wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'randonusername',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
});
