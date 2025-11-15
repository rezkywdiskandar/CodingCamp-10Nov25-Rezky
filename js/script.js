// ===== To-Do List Application =====
// Initialize data from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let filteredTodos = [...todos];

// DOM Elements
const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const filterInput = document.getElementById('filter-input');
const filterDateSelect = document.getElementById('filter-date');
const resetFilterBtn = document.getElementById('reset-filter-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const inputError = document.getElementById('input-error');
const dateError = document.getElementById('date-error');

// ===== Event Listeners =====
addBtn.addEventListener('click', addTodo);
resetFilterBtn.addEventListener('click', resetFilter);
clearAllBtn.addEventListener('click', clearAllTodos);
filterInput.addEventListener('input', applyFilter);
filterDateSelect.addEventListener('change', applyFilter);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// ===== Core Functions =====

/**
 * Add a new todo to the list
 */
function addTodo() {
    const title = todoInput.value.trim();
    const date = todoDate.value;

    // Clear error messages
    inputError.textContent = '';
    dateError.textContent = '';

    // Validation
    if (!title) {
        inputError.textContent = 'Please enter a to-do title';
        return;
    }

    if (!date) {
        dateError.textContent = 'Please select a date';
        return;
    }

    // Create new todo object
    const newTodo = {
        id: Date.now(),
        title: title,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // Add to todos array
    todos.push(newTodo);
    saveTodos();

    // Clear input fields
    todoInput.value = '';
    todoDate.value = '';
    todoInput.focus();

    // Update display
    updateFilterDateOptions();
    renderTodos(todos);
}

/**
 * Delete a todo by ID
 */
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    updateFilterDateOptions();
    applyFilter();
}

/**
 * Toggle todo completion status
 */
function toggleTodoComplete(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        applyFilter();
    }
}

/**
 * Apply filters based on input and date
 */
function applyFilter() {
    const searchTerm = filterInput.value.toLowerCase();
    const selectedDate = filterDateSelect.value;

    filteredTodos = todos.filter(todo => {
        const matchesTitle = todo.title.toLowerCase().includes(searchTerm);
        const matchesDate = !selectedDate || todo.date === selectedDate;
        return matchesTitle && matchesDate;
    });

    renderTodos(filteredTodos);
}

/**
 * Reset all filters
 */
function resetFilter() {
    filterInput.value = '';
    filterDateSelect.value = '';
    filteredTodos = [...todos];
    renderTodos(filteredTodos);
}

/**
 * Clear all todos with confirmation
 */
function clearAllTodos() {
    if (todos.length === 0) {
        alert('No to-do items to clear');
        return;
    }

    if (confirm('Are you sure you want to delete all to-do items? This action cannot be undone.')) {
        todos = [];
        filteredTodos = [];
        saveTodos();
        updateFilterDateOptions();
        renderTodos([]);
    }
}

/**
 * Render todos to the DOM
 */
function renderTodos(todosToRender) {
    // Clear the list
    todoList.innerHTML = '';

    // Update count
    updateTodoCount(todosToRender.length);

    // Show empty state if no todos
    if (todosToRender.length === 0) {
        todoList.innerHTML = '<li class="empty-state"><i class="fas fa-inbox"></i> No to-do items yet. Add one to get started!</li>';
        return;
    }

    // Render each todo
    todosToRender.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

/**
 * Create a todo element
 */
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const formattedDate = formatDate(todo.date);

    li.innerHTML = `
        <div class="todo-content">
            <div class="todo-title">${escapeHtml(todo.title)}</div>
            <div class="todo-date"><i class="fas fa-calendar"></i> ${formattedDate}</div>
        </div>
        <div class="todo-actions">
            <button class="btn btn-complete" onclick="toggleTodoComplete(${todo.id})" title="Mark as ${todo.completed ? 'incomplete' : 'complete'}">
                <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i> ${todo.completed ? 'Undo' : 'Done'}
            </button>
            <button class="btn btn-delete" onclick="deleteTodo(${todo.id})" title="Delete this todo">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    return li;
}

/**
 * Update the todo count display
 */
function updateTodoCount(count) {
    const label = count === 1 ? 'item' : 'items';
    todoCount.textContent = `${count} ${label}`;
}

/**
 * Update filter date select options
 */
function updateFilterDateOptions() {
    // Get unique dates from todos
    const uniqueDates = [...new Set(todos.map(todo => todo.date))].sort();

    // Keep the first option (Filter by date)
    const currentValue = filterDateSelect.value;
    filterDateSelect.innerHTML = '<option value="">Filter by date</option>';

    // Add date options
    uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDate(date);
        filterDateSelect.appendChild(option);
    });

    // Restore previous selection if it still exists
    filterDateSelect.value = currentValue;
}

/**
 * Save todos to localStorage
 */
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Format date from YYYY-MM-DD to readable format
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== Initialize Application =====
window.addEventListener('DOMContentLoaded', () => {
    updateFilterDateOptions();
    renderTodos(todos);
}); 