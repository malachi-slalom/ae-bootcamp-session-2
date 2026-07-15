process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('TODO API integration', () => {
  it('supports full create -> update -> complete -> delete lifecycle', async () => {
    const createResponse = await request(app)
      .post('/api/todos')
      .send({
        title: 'Lifecycle Task',
        description: 'Created in integration test',
        dueDate: '2030-01-10',
        priority: 'Medium',
      })
      .set('Accept', 'application/json');

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body.id;

    const updateResponse = await request(app)
      .patch(`/api/todos/${createdId}`)
      .send({ priority: 'High', description: 'Updated description' })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createdId,
      priority: 'High',
      description: 'Updated description',
    });

    const completeResponse = await request(app)
      .patch(`/api/todos/${createdId}/completion`)
      .send({ completed: true })
      .set('Accept', 'application/json');

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.completed).toBe(true);

    const deleteResponse = await request(app).delete(`/api/todos/${createdId}`);
    expect(deleteResponse.status).toBe(200);

    const notFoundResponse = await request(app).patch(`/api/todos/${createdId}`).send({ title: 'Nope' });
    expect(notFoundResponse.status).toBe(404);
  });
});
