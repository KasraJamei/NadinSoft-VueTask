describe('TodosView - Complete Test Suite', () => {
    beforeEach(() => {
        // Setup local storage for user settings
        cy.window().then(win => {
            win.localStorage.setItem('userSettings', JSON.stringify({
                name: 'Kasra',
                theme: 'light',
                locale: 'en',
                memberSince: '2025-11-04T19:09:39.685Z'
            }));
        });

        // Visit the page and ensure the main title is visible
        cy.visit('http://localhost:5173/todos');
        cy.contains('TODO List').should('be.visible');
    });

    it('should add a new todo', () => {
        // Add a todo and check for its visibility
        cy.get('[data-testid="todo-input"]').type('Buy groceries');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.contains('Buy groceries').should('be.visible');
    });

    it('should complete a todo', () => {
        // Add a todo
        cy.get('[data-testid="todo-input"]').type('Buy groceries');
        cy.get('[data-testid="add-todo-btn"]').click();

        // Click the checkbox to complete the todo
        cy.contains('Buy groceries').parents('.todo-item').find('.v-checkbox-btn').click();
        cy.wait(300);

        // Check for the completed style (line-through)
        cy.contains('Buy groceries').should('have.class', 'text-decoration-line-through');
    });

    it('should edit a todo', () => {
        // Add a todo
        cy.get('[data-testid="todo-input"]').type('Buy groceries');
        cy.get('[data-testid="add-todo-btn"]').click();

        // Click the edit button
        cy.contains('Buy groceries').parents('.todo-item').find('[data-testid="edit-todo-btn"]').click();
        cy.wait(400);

        // Edit the todo text and save
        cy.get('[data-testid="edit-todo-input"]').should('be.visible').clear().type('Buy milk');
        cy.get('[data-testid="save-edit-btn"]').click();
        cy.wait(500);

        // Check for the updated todo
        cy.contains('Buy milk').should('be.visible');
    });

    it('should delete a single todo', () => {
        // Add a todo
        cy.get('[data-testid="todo-input"]').type('Buy groceries');
        cy.get('[data-testid="add-todo-btn"]').click();

        // Click delete button, confirm the action in the dialog, and check for deletion
        cy.contains('Buy groceries').parents('.todo-item').find('[data-testid="delete-todo-btn"]').click();
        cy.wait(400);

        cy.get('[role="dialog"]').should('be.visible').find('button').contains('Delete').click();
        cy.wait(500);

        cy.contains('Buy groceries').should('not.exist');
    });

    it('should delete all todos', () => {
        // Add multiple todos
        cy.get('[data-testid="todo-input"]').type('Task 1');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.get('[data-testid="todo-input"]').type('Task 2');
        cy.get('[data-testid="add-todo-btn"]').click();

        // Click Delete All and confirm in the dialog
        cy.contains('button', 'Delete All').first().click();
        cy.wait(400);

        cy.get('[role="dialog"]').should('be.visible').find('button').contains('Delete All').click();
        cy.wait(500);

        // Check if the empty list alert is visible
        cy.contains('Your task list is empty').should('be.visible');
    });

    it('should filter todos by pending', () => {
        // Add tasks and complete one
        cy.get('[data-testid="todo-input"]').type('Task 1');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.get('[data-testid="todo-input"]').type('Task 2');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.contains('Task 1').parents('.todo-item').find('.v-checkbox-btn').click();
        cy.wait(300);

        // Open the filter dropdown and select 'Pending'
        cy.get('.v-select').first().find('.v-field').click();
        cy.wait(500);
        cy.get('.v-list-item-title').contains('Pending').click();
        cy.wait(300);

        // Verify only pending task is visible
        cy.contains('Task 2').should('be.visible');
        cy.contains('Task 1').should('not.exist');
    });

    it('should filter todos by completed', () => {
        // Add tasks and complete one
        cy.get('[data-testid="todo-input"]').type('Task 1');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.get('[data-testid="todo-input"]').type('Task 2');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.contains('Task 1').parents('.todo-item').find('.v-checkbox-btn').click();
        cy.wait(300);

        // Open the filter dropdown and select 'Completed'
        cy.get('.v-select').first().find('.v-field').click();
        cy.wait(500);
        cy.get('.v-list-item-title').contains('Completed').click();
        cy.wait(300);

        // Verify only completed task is visible
        cy.contains('Task 1').should('be.visible');
        cy.contains('Task 2').should('not.exist');
    });

    it('should sort todos alphabetically', () => {
        // Add tasks in reverse alphabetical order
        cy.get('[data-testid="todo-input"]').type('Zebra');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.get('[data-testid="todo-input"]').type('Apple');
        cy.get('[data-testid="add-todo-btn"]').click();

        // Open the sort dropdown and select 'Alphabetical'
        cy.get('.v-select').eq(1).find('.v-field').click();
        cy.wait(500);
        cy.get('.v-list-item-title').contains('Alphabetical').click();
        cy.wait(300);

        // Check if 'Apple' is the first item
        cy.get('.todo-item').first().should('contain', 'Apple');
    });

    it('should sort todos by creation time', () => {
        // Add tasks
        cy.get('[data-testid="todo-input"]').type('First');
        cy.get('[data-testid="add-todo-btn"]').click();
        cy.get('[data-testid="todo-input"]').type('Second');
        cy.get('[data-testid="add-todo-btn"]').click();

        // Open the sort dropdown and select 'Creation Time'
        cy.get('.v-select').eq(1).find('.v-field').click();
        cy.wait(500);
        cy.get('.v-list-item-title').contains('Creation Time').click();
        cy.wait(300);

        // Check if 'First' is the first item
        cy.get('.todo-item').first().should('contain', 'First');
    });
});