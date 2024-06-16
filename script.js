const apiUrl = 'http://localhost:3000/api'; // Assuming backend API url

const authSection = document.getElementById('authSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const filterAllBtn = document.getElementById('filterAll');
const filterCompletedBtn = document.getElementById('filterCompleted');
const filterIncompleteBtn = document.getElementById('filterIncomplete');

let authToken = localStorage.getItem('authToken');

// Check if user is authenticated
function isAuthenticated() {
  return authToken !== null;
}

// Event listeners
loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (email === '' || password === '') return;

  login(email, password);
});

logoutBtn.addEventListener('click', function() {
  logout();
});

taskForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  addTask(taskText);
  saveTasksToLocalStorage();
  taskInput.value = '';
});

filterAllBtn.addEventListener('click', function() {
  showAllTasks();
});

filterCompletedBtn.addEventListener('click', function() {
  showCompletedTasks();
});

filterIncompleteBtn.addEventListener('click', function() {
  showIncompleteTasks();
});

// Initial tasks from localStorage
document.addEventListener('DOMContentLoaded', function() {
  if (isAuthenticated()) {
    showAuthenticatedUI();
    loadTasks();
  } else {
    showLoginForm();
  }
});

function login(email, password) {
  fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  .then(response => response.json())
  .then(data => {
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    showAuthenticatedUI();
    loadTasks();
  })
  .catch(error => console.error('Login error:', error));
}

function logout() {
  localStorage.removeItem('authToken');
  authToken = null;
  showLoginForm();
  clearTaskList();
}

function loadTasks() {
  fetch(`${apiUrl}/tasks`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
  .then(response => response.json())
  .then(tasks => {
    tasks.forEach(task => addTask(task.text, task.completed));
  })
  .catch(error => console.error('Failed to load tasks:', error));
}

function addTask(taskText, completed = false) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span>${taskText}</span>
    <button class="edit-btn">Edit</button>
    <button class="complete-btn">${completed ? 'Undo' : 'Complete'}</button>
    <button class="delete-btn">Delete</button>
  `;
  if (completed) {
    li.classList.add('completed');
  }

  // Edit task
  li.querySelector('.edit-btn').addEventListener('click', function() {
    editTask(li);
  });

  // Mark task as completed or undo
  li.querySelector('.complete-btn').addEventListener('click', function() {
    toggleTaskCompletion(li);
    saveTasksToLocalStorage();
  });

  // Delete task
  li.querySelector('.delete-btn').addEventListener('click', function() {
    deleteTask(li);
    saveTasksToLocalStorage();
  });

  taskList.appendChild(li);
}

function editTask(li) {
  const span = li.querySelector('span');
  const newTaskText = prompt('Edit task:', span.textContent);
  if (newTaskText !== null && newTaskText.trim() !== '') {
    span.textContent = newTaskText;
    saveTasksToLocalStorage();
  }
}

function toggleTaskCompletion(li) {
  li.classList.toggle('completed');
  const completeBtn = li.querySelector('.complete-btn');
  completeBtn.textContent = li.classList.contains('completed') ? 'Undo' : 'Complete';
}

function deleteTask(li) {
  li.remove();
}

function clearTaskList() {
  taskList.innerHTML = '';
}

function showLoginForm() {
  authSection.style.display = 'block';
  loginForm.reset();
  taskForm.style.display = 'none';
  document.querySelector('.filter-options').style.display = 'none';
  taskList.style.display = 'none';
  logoutBtn.style.display = 'none';
}

function showAuthenticatedUI() {
  authSection.style.display = 'none';
  taskForm.style.display = 'block';
  document.querySelector('.filter-options').style.display = 'flex';
  taskList.style.display = 'block';
  logoutBtn.style.display = 'block';
}

function showAllTasks() {
  const tasks = Array.from(taskList.children);
  tasks.forEach(task => task.style.display = 'flex');
}

function showCompletedTasks() {
  showAllTasks();
  const incompleteTasks = Array.from(taskList.children).filter(task => !task.classList.contains('completed'));
  incompleteTasks.forEach(task => task.style.display = 'none');
}

function showIncompleteTasks() {
  showAllTasks();
  const completedTasks = Array.from(taskList.children).filter(task => task.classList.contains('completed'));
  completedTasks.forEach(task => task.style.display = 'none');
}

function saveTasksToLocalStorage() {
  const tasks = Array.from(taskList.children).map(task => ({
    text: task.querySelector('span').textContent,
    completed: task.classList.contains('completed')
  }));
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
