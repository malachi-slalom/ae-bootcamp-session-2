process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('TODO API', () => {
  const createTodo = async (payload = {}) => {
    const response = await request(app)
      .post('/api/todos')
      .send({
        title: 'Test Task',
        description: 'Task description',
        priority: 'Medium',
        ...payload,
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    return response.body;
  };

  it('creates and lists tasks', async () => {
    const created = await createTodo({ title: 'Create and List Task' });

    expect(created).toMatchObject({
      id: expect.any(Number),
      title: 'Create and List Task',
      description: 'Task description',
      priority: 'Medium',
      completed: false,
    });

    const listResponse = await request(app).get('/api/todos');
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((todo) => todo.id === created.id)).toBe(true);
  });

  it('returns 400 for empty title', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: '' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Task title is required');
  });

  it('returns 400 for invalid due date', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Date test', dueDate: 'invalid' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Due date must be a valid date in YYYY-MM-DD format'
    );
  });

  it('updates an existing task', async () => {
    const created = await createTodo({ title: 'Old Title', priority: 'Low' });

    const response = await request(app)
      .patch(`/api/todos/${created.id}`)
      .send({ title: 'New Title', priority: 'High' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.id,
      title: 'New Title',
      priority: 'High',
    });
  });

  it('toggles completion state', async () => {
    const created = await createTodo({ title: 'Completion Task' });

    const response = await request(app)
      .patch(`/api/todos/${created.id}/completion`)
      .send({ completed: true })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('completed', true);
  });

  it('filters by completed status', async () => {
    const activeTodo = await createTodo({ title: 'Active Filter Task' });
    const completedTodo = await createTodo({ title: 'Completed Filter Task' });

    await request(app)
      .patch(`/api/todos/${completedTodo.id}/completion`)
      .send({ completed: true })
      .set('Accept', 'application/json');

    const activeResponse = await request(app).get('/api/todos?status=active');
    expect(activeResponse.status).toBe(200);
    expect(activeResponse.body.every((todo) => todo.completed === false)).toBe(true);
    expect(activeResponse.body.some((todo) => todo.id === activeTodo.id)).toBe(true);

    const completedResponse = await request(app).get('/api/todos?status=completed');
    expect(completedResponse.status).toBe(200);
    expect(completedResponse.body.every((todo) => todo.completed === true)).toBe(true);
  });

  it('searches by title', async () => {
    await createTodo({ title: 'Searchable Task' });
    await createTodo({ title: 'Another Task' });

    const response = await request(app).get('/api/todos?search=searchable');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.every((todo) => /searchable/i.test(todo.title))).toBe(true);
  });

  it('deletes a task', async () => {
    const created = await createTodo({ title: 'Delete Task' });

    const deleteResponse = await request(app).delete(`/api/todos/${created.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: created.id });

    const deleteAgain = await request(app).delete(`/api/todos/${created.id}`);
    expect(deleteAgain.status).toBe(404);
    expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
  });
});
