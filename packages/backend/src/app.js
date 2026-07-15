const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PRIORITY_VALUES = ['Low', 'Medium', 'High'];
const DEFAULT_PRIORITY = 'Medium';
const dbPath = process.env.DB_PATH ||
  (process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.join(__dirname, '../data/todos.db'));

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT NOT NULL DEFAULT '${DEFAULT_PRIORITY}',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const mapTodo = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  dueDate: row.due_date,
  priority: row.priority,
  completed: Boolean(row.completed),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const isValidDueDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (typeof value !== 'string') {
    return false;
  }

  const isDateString = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!isDateString) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const normalizeDueDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return value;
};

const getTodoById = db.prepare('SELECT * FROM todos WHERE id = ?');
const createTodoStmt = db.prepare(`
  INSERT INTO todos (title, description, due_date, priority, completed)
  VALUES (@title, @description, @dueDate, @priority, @completed)
`);
const deleteTodoStmt = db.prepare('DELETE FROM todos WHERE id = ?');

const buildTodoListQuery = ({ status, overdue, search }) => {
  const whereClauses = [];
  const params = {};

  if (status === 'active') {
    whereClauses.push('completed = 0');
  }

  if (status === 'completed') {
    whereClauses.push('completed = 1');
  }

  if (overdue) {
    whereClauses.push("completed = 0 AND due_date IS NOT NULL AND due_date < DATE('now', 'localtime')");
  }

  if (search) {
    whereClauses.push('LOWER(title) LIKE LOWER(@search)');
    params.search = `%${search}%`;
  }

  const whereClause = whereClauses.length > 0
    ? `WHERE ${whereClauses.join(' AND ')}`
    : '';

  return {
    sql: `
      SELECT *
      FROM todos
      ${whereClause}
      ORDER BY
        completed ASC,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
        due_date ASC,
        created_at DESC
    `,
    params,
  };
};

const validatePriority = (priority) => PRIORITY_VALUES.includes(priority);

const validateTitle = (title) => typeof title === 'string' && title.trim() !== '';

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/todos', (req, res) => {
  try {
    const { status = 'all', overdue, search = '' } = req.query;

    if (!['all', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: all, active, completed' });
    }

    const includeOverdueOnly = overdue === 'true';
    const { sql, params } = buildTodoListQuery({
      status,
      overdue: includeOverdueOnly,
      search: search.trim(),
    });

    const todos = db.prepare(sql).all(params).map(mapTodo);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const {
      title,
      description = '',
      dueDate,
      priority = DEFAULT_PRIORITY,
      completed = false,
    } = req.body;

    if (!validateTitle(title)) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!validatePriority(priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    if (!isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be a valid date in YYYY-MM-DD format' });
    }

    const result = createTodoStmt.run({
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      dueDate: normalizeDueDate(dueDate),
      priority,
      completed: completed ? 1 : 0,
    });

    const todo = getTodoById.get(result.lastInsertRowid);
    res.status(201).json(mapTodo(todo));
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.patch('/api/todos/:id', (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTodo = getTodoById.get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = {
      title: req.body.title !== undefined ? req.body.title : existingTodo.title,
      description: req.body.description !== undefined ? req.body.description : existingTodo.description,
      dueDate: req.body.dueDate !== undefined ? req.body.dueDate : existingTodo.due_date,
      priority: req.body.priority !== undefined ? req.body.priority : existingTodo.priority,
      completed: req.body.completed !== undefined ? req.body.completed : Boolean(existingTodo.completed),
    };

    if (!validateTitle(updates.title)) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!validatePriority(updates.priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    if (typeof updates.completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }

    if (!isValidDueDate(updates.dueDate)) {
      return res.status(400).json({ error: 'Due date must be a valid date in YYYY-MM-DD format' });
    }

    const updateStmt = db.prepare(`
      UPDATE todos
      SET
        title = @title,
        description = @description,
        due_date = @dueDate,
        priority = @priority,
        completed = @completed,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    updateStmt.run({
      id,
      title: updates.title.trim(),
      description: typeof updates.description === 'string' ? updates.description.trim() : '',
      dueDate: normalizeDueDate(updates.dueDate),
      priority: updates.priority,
      completed: updates.completed ? 1 : 0,
    });

    const updatedTodo = getTodoById.get(id);
    res.json(mapTodo(updatedTodo));
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/completion', (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const { completed } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }

    const existingTodo = getTodoById.get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare(`
      UPDATE todos
      SET completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(completed ? 1 : 0, id);

    const updatedTodo = getTodoById.get(id);
    res.json(mapTodo(updatedTodo));
  } catch (error) {
    console.error('Error toggling completion state:', error);
    res.status(500).json({ error: 'Failed to update completion state' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTodo = getTodoById.get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const result = deleteTodoStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db };