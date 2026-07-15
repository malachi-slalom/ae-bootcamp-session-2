class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Task title');
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async createTask(title) {
    await this.titleInput.fill(title);
    await this.addTaskButton.click();
  }

  taskTitle(title) {
    return this.page.getByText(title, { exact: true });
  }

  taskItem(title) {
    return this.page.getByRole('listitem').filter({ has: this.taskTitle(title) });
  }

  async deleteTask(title) {
    const taskItem = this.taskItem(title);

    if (await taskItem.isVisible()) {
      await taskItem.getByRole('button', { name: 'Delete' }).click();
    }
  }
}

module.exports = { TodoPage };
