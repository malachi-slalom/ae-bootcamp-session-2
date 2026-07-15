import React, { useState, useEffect } from 'react';
import './App.css';

const PRIORITIES = ['Low', 'Medium', 'High'];

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [statusFilter, overdueOnly, searchTerm]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        overdue: overdueOnly ? 'true' : 'false',
        search: searchTerm,
      });

      const response = await fetch(`/api/todos?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTodos(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setEditingTodo(null);
    setValidationError('');
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    if (dueDate && Number.isNaN(new Date(`${dueDate}T00:00:00.000Z`).getTime())) {
      setValidationError('Please enter a valid due date.');
      return;
    }

    const payload = {
      title,
      description,
      dueDate: dueDate || null,
      priority,
    };

    try {
      const isEditing = Boolean(editingTodo);
      const response = await fetch(isEditing ? `/api/todos/${editingTodo.id}` : '/api/todos', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save task');
      }

      resetForm();
      await fetchTodos();
      setError(null);
    } catch (err) {
      setError('Error saving task: ' + err.message);
      console.error('Error saving task:', err);
    }
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setDueDate(todo.dueDate || '');
    setPriority(todo.priority);
    setValidationError('');
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/todos/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete task');
      }

      await fetchTodos();
      setError(null);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleCompletion = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}/completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update completion state');
      }

      await fetchTodos();
      setError(null);
    } catch (err) {
      setError('Error updating completion state: ' + err.message);
      console.error('Error updating completion state:', err);
    }
  };

  const isOverdue = (todo) => {
    if (todo.completed || !todo.dueDate) {
      return false;
    }

    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const taskDate = new Date(`${todo.dueDate}T00:00:00.000Z`);
    return taskDate < currentDay;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODO Control Center</h1>
        <p>Track, sort, and complete your work.</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>{editingTodo ? 'Edit Task' : 'Create Task'}</h2>
          <form onSubmit={handleCreateOrUpdate} className="task-form">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title (required)"
              aria-label="Task title"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              aria-label="Task description"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Task due date"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Task priority"
            >
              {PRIORITIES.map((priorityOption) => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button type="submit">{editingTodo ? 'Save Task' : 'Add Task'}</button>
              {editingTodo && (
                <button type="button" onClick={resetForm} className="secondary-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
          {validationError && <p className="error">{validationError}</p>}
        </section>

        <section className="filters-section">
          <h2>Find Tasks</h2>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title"
              aria-label="Search tasks by title"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              Overdue only
            </label>
          </div>
        </section>

        <section className="items-section">
          <h2>Tasks</h2>
          {loading && <p>Loading tasks...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul>
              {todos.length > 0 ? (
                todos.map((todo) => (
                  <li
                    key={todo.id}
                    className={[
                      todo.completed ? 'task-completed' : '',
                      isOverdue(todo) ? 'task-overdue' : '',
                    ].join(' ')}
                  >
                    <div className="task-main">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleCompletion(todo)}
                          aria-label={`Mark ${todo.title} complete`}
                        />
                        <span className="task-title">{todo.title}</span>
                      </label>
                      <p className="task-description">{todo.description || 'No description'}</p>
                      <div className="task-meta">
                        <span className="priority-chip">Priority: {todo.priority}</span>
                        <span>Due: {todo.dueDate || 'None'}</span>
                        {isOverdue(todo) && <span className="overdue-badge">Overdue</span>}
                        {todo.completed && <span className="completed-badge">Completed</span>}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => startEdit(todo)} type="button" className="secondary-btn">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="delete-btn"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p>No tasks found. Create one to get started.</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;