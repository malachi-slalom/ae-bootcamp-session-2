import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let todosRequestCount = 0;

const mockTodos = [
  {
    id: 1,
    title: 'Active Task',
    description: 'An active task',
    dueDate: '2030-01-01',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 2,
    title: 'Completed Task',
    description: 'A completed task',
    dueDate: null,
    priority: 'Low',
    completed: true,
  },
];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    todosRequestCount += 1;
    const search = req.url.searchParams.get('search') || '';
    const status = req.url.searchParams.get('status') || 'all';

    let result = [...mockTodos];

    if (status === 'active') {
      result = result.filter((todo) => !todo.completed);
    }

    if (status === 'completed') {
      result = result.filter((todo) => todo.completed);
    }

    if (search) {
      result = result.filter((todo) => todo.title.toLowerCase().includes(search.toLowerCase()));
    }

    return res(ctx.status(200), ctx.json(result));
  }),
  rest.post('/api/todos', async (req, res, ctx) => {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 99,
        title: body.title,
        description: body.description || '',
        dueDate: body.dueDate || null,
        priority: body.priority || 'Medium',
        completed: false,
      })
    );
  }),
  rest.patch('/api/todos/:id/completion', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(200), ctx.json({ ...mockTodos[0], completed: body.completed }));
  }),
  rest.delete('/api/todos/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: Number(req.params.id) }));
  }),
  rest.patch('/api/todos/:id', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(200), ctx.json({ ...mockTodos[0], ...body }));
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  todosRequestCount = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const waitForTasksToReload = async () => {
  await waitFor(() => {
    expect(todosRequestCount).toBe(2);
    expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    expect(screen.getByText('Active Task')).toBeInTheDocument();
  });
};

describe('App', () => {
  test('renders and loads tasks', async () => {
    render(<App />);

    expect(screen.getByText('TODO Control Center')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });
  });

  test('creates a new task', async () => {
    const user = userEvent.setup();
    let createRequest;

    server.use(
      rest.post('/api/todos', async (req, res, ctx) => {
        createRequest = await req.json();
        return res(ctx.status(201), ctx.json({ id: 99, ...createRequest, completed: false }));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await act(async () => {
      await user.clear(screen.getByLabelText('Task title'));
      await user.type(screen.getByLabelText('Task title'), 'New Task');
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });

    await waitFor(() => {
      expect(createRequest).toEqual({
        title: 'New Task',
        description: '',
        dueDate: null,
        priority: 'Medium',
      });
    });
    await waitForTasksToReload();
  });

  test('edits an existing task', async () => {
    const user = userEvent.setup();
    let updateRequest;

    server.use(
      rest.patch('/api/todos/:id', async (req, res, ctx) => {
        updateRequest = { id: req.params.id, body: await req.json() };
        return res(ctx.status(200), ctx.json({ ...mockTodos[0], ...updateRequest.body }));
      })
    );

    render(<App />);

    const activeTask = await screen.findByText('Active Task');
    await act(async () => {
      await user.click(within(activeTask.closest('li')).getByRole('button', { name: 'Edit' }));
      await user.clear(screen.getByLabelText('Task title'));
      await user.type(screen.getByLabelText('Task title'), 'Updated Task');
      await user.selectOptions(screen.getByLabelText('Task priority'), 'High');
      await user.click(screen.getByRole('button', { name: 'Save Task' }));
    });

    await waitFor(() => {
      expect(updateRequest).toEqual({
        id: '1',
        body: {
          title: 'Updated Task',
          description: 'An active task',
          dueDate: '2030-01-01',
          priority: 'High',
        },
      });
    });
    await waitForTasksToReload();
  });

  test('marks a task complete', async () => {
    const user = userEvent.setup();
    let completionRequest;

    server.use(
      rest.patch('/api/todos/:id/completion', async (req, res, ctx) => {
        completionRequest = { id: req.params.id, body: await req.json() };
        return res(ctx.status(200), ctx.json({ ...mockTodos[0], completed: true }));
      })
    );

    render(<App />);

    const completionCheckbox = await screen.findByRole('checkbox', {
      name: 'Mark Active Task complete',
    });
    await act(async () => {
      await user.click(completionCheckbox);
    });

    await waitFor(() => {
      expect(completionRequest).toEqual({ id: '1', body: { completed: true } });
    });
    await waitForTasksToReload();
  });

  test('deletes a task', async () => {
    const user = userEvent.setup();
    let deletedId;

    server.use(
      rest.delete('/api/todos/:id', (req, res, ctx) => {
        deletedId = req.params.id;
        return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully' }));
      })
    );

    render(<App />);

    const activeTask = await screen.findByText('Active Task');
    await act(async () => {
      await user.click(within(activeTask.closest('li')).getByRole('button', { name: 'Delete' }));
    });

    await waitFor(() => {
      expect(deletedId).toBe('1');
    });
    await waitForTasksToReload();
  });

  test('shows validation message when title is empty', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await act(async () => {
      await user.clear(screen.getByLabelText('Task title'));
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });

    expect(screen.getByText('Task title is required.')).toBeInTheDocument();
  });

  test('filters tasks by status', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await act(async () => {
      await user.selectOptions(screen.getByLabelText('Filter by status'), 'completed');
    });

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
    });
  });

  test('searches by title as user types', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await act(async () => {
      await user.type(screen.getByLabelText('Search tasks by title'), 'completed');
    });

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
    });
  });
});
