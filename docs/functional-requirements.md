# Functional Requirements

This document lists the core functional requirements for the TODO app.

## Task Creation

- The user can create a new task with a required title.
- The user can optionally add a description when creating a task.
- The user can optionally add a due date to a task.
- The user can mark a new task with a priority level (`Low`, `Medium`, `High`).

## Task Viewing

- The user can view all tasks in a list.
- Each task displays its title, completion status, due date (if set), and priority.
- Completed and incomplete tasks are visually distinguishable.
- Overdue tasks are visually distinguished from tasks that are not overdue.

## Task Editing and Deletion

- The user can edit an existing task's title.
- The user can edit an existing task's description.
- The user can edit an existing task's due date.
- The user can edit an existing task's priority.
- The user can delete a task.

## Task Completion

- The user can mark a task as completed.
- The user can mark a completed task as incomplete.
- The completion state is saved and retained after page refresh.

## Sorting and Filtering

- Tasks are sorted by default in this order:
  1. Incomplete tasks before completed tasks.
  2. Within incomplete tasks, earlier due dates before later due dates.
  3. Tasks without due dates appear after tasks with due dates.
  4. For tasks with the same status and due date, most recently created appears first.
- The user can filter tasks by status (`All`, `Active`, `Completed`).
- The user can filter tasks to show only overdue items.

## Search

- The user can search tasks by title.
- Search results update as the user types.

## Data Persistence

- Task data persists between sessions.
- On load, the app restores the last saved set of tasks.

## Validation and Error Handling

- The app prevents creating a task with an empty title.
- The app provides a clear validation message when required input is missing.
- The app handles invalid due date input with a user-friendly error message.
