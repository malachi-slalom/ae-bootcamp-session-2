const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./page-objects/todoPage');

test.describe('Todo workflow', () => {
  test('user can create a new task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const taskTitle = `Playwright task ${Date.now()}`;

    await todoPage.goto();
    await todoPage.createTask(taskTitle);

    try {
      await expect(todoPage.taskTitle(taskTitle)).toBeVisible();
    } finally {
      await todoPage.deleteTask(taskTitle);
    }
  });
});
