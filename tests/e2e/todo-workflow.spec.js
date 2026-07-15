const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./page-objects/todoPage');

test.describe('Todo workflow', () => {
  test('user can create a new task', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.createTask('Playwright task');

    await expect(todoPage.taskTitle('Playwright task')).toBeVisible();
  });
});
