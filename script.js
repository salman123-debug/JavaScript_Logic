/**
 * Thiranex Assignment Engine: State-Driven Architecture (With Advanced Edge-Case Handling)
 */

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
    localStorage.setItem('thiranex_todos', JSON.stringify(todoState.items));
    renderTasks();
}

// 3. CORE CRUD CAPABILITIES (With Strict Validation & Anti-Duplication)
function createTodo(text) {
    const cleanText = text.trim();
    
    // Validation 1: Prevent Empty or Whitespace Tasks
    if (!cleanText) return; 

    // Validation 2: Anti-Duplication Engine (Case-Insensitive Check)
    const isDuplicate = todoState.items.some(
        todo => todo.text.toLowerCase() === cleanText.toLowerCase()
    );
    if (isDuplicate) {
        alert("⚠️ This task already exists in your list!");
        return;
    }

    const newTodo = {
        id: 'todo_' + Date.now(), 
        text: cleanText,
        completed: false,
        isEditing: false
    };
    todoState.items.push(newTodo);
    saveAndRenderState();
}

function updateTodoText(id, newText) {
    const cleanText = newText.trim();
    const item = todoState.items.find(todo => todo.id === id);
    
    if (item) {
        if (!cleanText) {
            alert("⚠️ Task content cannot be empty!");
            return;
        }
        item.text = cleanText;
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
    renderTasks(); 
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
    todoListContainer.innerHTML = ''; 
    const visibleTasks = getFilteredTodos();

    // Advanced Addition: Empty State UI Placeholder Handler
    if (visibleTasks.length === 0) {
        let dynamicMessage = "🎉 All caught up! No tasks left.";
        if (todoState.currentFilter === 'active') dynamicMessage = "⚡ No active tasks to complete!";
        if (todoState.currentFilter === 'completed') dynamicMessage = "🏁 You haven't finished any tasks yet!";

        todoListContainer.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: var(--text-muted); font-style: italic;">
                ${dynamicMessage}
            </div>
        `;
        
        // Counter synchronization for empty state
        updateActiveCounter();
        return;
    }

    visibleTasks.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

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

    updateActiveCounter();
}

// Helper function to update counters dynamically
function updateActiveCounter() {
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
        parentLI.querySelector('.todo-text-input').focus();
    } else if (target.classList.contains('save-action')) {
        const inputField = parentLI.querySelector('.todo-text-input');
        updateTodoText(todoId, inputField.value);
    }
});

todoListContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('todo-text-input')) {
        const parentLI = e.target.closest('.todo-item');
        updateTodoText(parentLI.dataset.id, e.target.value);
    }
});

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
