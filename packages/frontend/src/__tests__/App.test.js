import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

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
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App', () => {
  test('renders and loads tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('TODO Control Center')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });
  });

  test('creates a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText('Task title'));
    await user.type(screen.getByLabelText('Task title'), 'New Task');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(screen.queryByText('Task title is required.')).not.toBeInTheDocument();
    });
  });

  test('shows validation message when title is empty', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText('Task title'));
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(screen.getByText('Task title is required.')).toBeInTheDocument();
  });

  test('filters tasks by status', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'completed');

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
    });
  });

  test('searches by title as user types', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Active Task')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Search tasks by title'), 'completed');

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.queryByText('Active Task')).not.toBeInTheDocument();
    });
  });
});
