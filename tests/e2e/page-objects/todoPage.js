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
}

module.exports = { TodoPage };
