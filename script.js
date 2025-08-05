// Todo App JavaScript
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTodos();
        this.updateStats();
    }

    initializeElements() {
        // Input elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');

        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');

        // Filter elements
        this.filterBtns = document.querySelectorAll('.filter-btn');

        // Action buttons
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
    }

    bindEvents() {
        // Add task events
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Action button events
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.todoInput.value = '';
        this.todoInput.focus();

        // Show success feedback
        this.showNotification('Task added successfully!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit task:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveTodos();
            this.renderTodos();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification('Task deleted successfully!', 'info');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTodos();
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification(`${completedCount} completed task(s) cleared!`, 'success');
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showNotification('No tasks to clear!', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${this.todos.length} task(s)?`)) {
            this.todos = [];
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'pending':
                return this.todos.filter(t => !t.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = '';
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');
        this.todoList.innerHTML = '';

        filteredTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo(${todo.id})"></div>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="todo-btn edit-btn" onclick="todoApp.editTodo(${todo.id})" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="todo-btn delete-btn" onclick="todoApp.deleteTodo(${todo.id})" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return li;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        // Add animation keyframes if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#667eea';
        }
    }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Add some sample tasks for demonstration
document.addEventListener('DOMContentLoaded', () => {
    // Add sample tasks if no todos exist
    if (todoApp.todos.length === 0) {
        const sampleTasks = [
            'Complete the To-Do app project',
            'Learn Vanilla JavaScript',
            'Practice CSS animations',
            'Build responsive layouts'
        ];

        sampleTasks.forEach((task, index) => {
            setTimeout(() => {
                todoApp.todoInput.value = task;
                todoApp.addTodo();
            }, index * 500);
        });
    }
}); 
