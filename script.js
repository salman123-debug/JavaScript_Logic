

// 1. GLOBAL STATE DEFINITION
let todoState = {
    items: JSON.parse(localStorage.getItem('thiranex_todos')) || [],
    currentFilter: 'all'
};

// DOM SELECTORS
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListContainer = document.getElementById('todo-list');
const itemsCountDisplay = document.getElementById('items-count');
const filterButtonsContainer = document.querySelector('.filter-buttons');
const clearCompletedBtn = document.getElementById('clear-completed');

// 2. STATE MANAGER & PERSISTENCE MECHANISM
function saveAndRenderState() {
    // Automatically persist state into window.localStorage
    localStorage.setItem('thiranex_todos', JSON.stringify(todoState.items));
    renderTasks();
}

// 3. CORE CRUD CAPABILITIES
function createTodo(text) {
    const newTodo = {
        id: 'todo_' + Date.now(), // Unique identity strategy
        text: text.trim(),
        completed: false,
        isEditing: false
    };
    todoState.items.push(newTodo);
    saveAndRenderState();
}

function updateTodoText(id, newText) {
    const item = todoState.items.find(todo => todo.id === id);
    if (item && newText.trim() !== "") {
        item.text = newText.trim();
        item.isEditing = false;
    }
    saveAndRenderState();
}

function toggleTodoStatus(id) {
    const item = todoState.items.find(todo => todo.id === id);
    if (item) item.completed = !item.completed;
    saveAndRenderState();
}

function toggleEditState(id) {
    const item = todoState.items.find(todo => todo.id === id);
    if (item) item.isEditing = !item.isEditing;
    renderTasks(); // Render localized update
}

function deleteTodo(id) {
    todoState.items = todoState.items.filter(todo => todo.id !== id);
    saveAndRenderState();
}

// 4. ADVANCED RUNTIME FILTERING ENGINE
function getFilteredTodos() {
    switch (todoState.currentFilter) {
        case 'active':
            return todoState.items.filter(todo => !todo.completed);
        case 'completed':
            return todoState.items.filter(todo => todo.completed);
        default:
            return todoState.items;
    }
}

// 5. DYNAMIC DOM RENDERER
function renderTasks() {
    todoListContainer.innerHTML = ''; // Memory reset
    const visibleTasks = getFilteredTodos();

    visibleTasks.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        // Structural UI setup based on Editing state
        const contentUI = todo.isEditing 
            ? `<input type="text" class="todo-text-input" value="${todo.text}">`
            : `<span class="todo-text">${todo.text}</span>`;

        const actionUI = todo.isEditing
            ? `<button class="edit-btn save-action">💾 Save</button>`
            : `<button class="edit-btn edit-action">✏️ Edit</button>`;

        li.innerHTML = `
            <div class="todo-content-box">
                <input type="checkbox" class="status-checkbox" ${todo.completed ? 'checked' : ''}>
                ${contentUI}
            </div>
            <div class="action-buttons">
                ${actionUI}
                <button class="delete-btn delete-action">🗑️ Delete</button>
            </div>
        `;
        todoListContainer.appendChild(li);
    });

    // Track active item matrix values
    const activeCount = todoState.items.filter(todo => !todo.completed).length;
    itemsCountDisplay.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// 6. HIGH-PERFORMANCE DELEGATED EVENT LISTENERS
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (todoInput.value.trim()) {
        createTodo(todoInput.value);
        todoInput.value = '';
    }
});

// Single point event capturing on container (Delegated Architecture)
todoListContainer.addEventListener('click', (e) => {
    const target = e.target;
    const parentLI = target.closest('.todo-item');
    if (!parentLI) return;
    const todoId = parentLI.dataset.id;

    if (target.classList.contains('status-checkbox')) {
        toggleTodoStatus(todoId);
    } else if (target.classList.contains('delete-action')) {
        deleteTodo(todoId);
    } else if (target.classList.contains('edit-action')) {
        toggleEditState(todoId);
        // Direct focus on entry context field
        parentLI.querySelector('.todo-text-input').focus();
    } else if (target.classList.contains('save-action')) {
        const inputField = parentLI.querySelector('.todo-text-input');
        updateTodoText(todoId, inputField.value);
    }
});

// Inline updates capturing inside list
todoListContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('todo-text-input')) {
        const parentLI = e.target.closest('.todo-item');
        updateTodoText(parentLI.dataset.id, e.target.value);
    }
});

// Structural view filtering events
filterButtonsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        todoState.currentFilter = e.target.dataset.filter;
        renderTasks();
    }
});

clearCompletedBtn.addEventListener('click', () => {
    todoState.items = todoState.items.filter(todo => !todo.completed);
    saveAndRenderState();
});

// INITIAL APPLICATION BOOTSTRAP
document.addEventListener('DOMContentLoaded', renderTasks);
