// cypress/e2e/task-manager.cy.js

describe('Task Manager with Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should log in and add a new task', () => {
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password');
    cy.get('#loginForm button[type="submit"]').click();

    cy.get('#taskInput').type('New task').type('{enter}');
    cy.get('#taskList li').should('have.length', 3); // Adjust based on initial tasks
    cy.contains('New task').should('be.visible');
  });

  it('should mark a task as completed', () => {
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password');
    cy.get('#loginForm button[type="submit"]').click();

    cy.get('#taskList li:first .complete-btn').click();
    cy.get('#taskList li:first .complete-btn').should('have.text', 'Undo');
    cy.get('#taskList li:first').should('have.class', 'completed');
  });

  it('should edit a task', () => {
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password');
    cy.get('#loginForm button[type="submit"]').click();
  
    cy.get('#taskList li:first .edit-btn').click();
  
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Updated task');
    });
  
    cy.get('#taskList li:first span').should('contain', 'Updated task');
  });

  it('should delete a task', () => {
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password');
    cy.get('#loginForm button[type="submit"]').click();

    cy.get('#taskList li:first .delete-btn').click();
    cy.get('#taskList li').should('have.length', 1); // Adjust based on initial tasks
  });

  it('should log out', () => {
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password');
    cy.get('#loginForm button[type="submit"]').click();
  
    cy.get('#authSection').should('have.css', 'display', 'none');
    cy.get('#authSection').then(($authSection) => {
      $authSection[0].style.display = 'block';
    });
  
    cy.get('#logoutBtn').click();
    cy.get('#loginForm').should('be.visible');
  });
});