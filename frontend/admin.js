// Admin Dashboard JavaScript

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Check if user is logged in
let isLoggedIn = false;
let authToken = localStorage.getItem('admin_token');

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Check authentication
    if (authToken) {
        isLoggedIn = true;
        showDashboard();
    } else {
        showLogin();
    }
    
    // Setup login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup tabs
    setupTabs();
    
    // Load dashboard data if logged in
    if (isLoggedIn) {
        loadDashboardData();
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load tab data
    loadTabData(tabName);
}

function showLogin() {
    document.getElementById('login-section').classList.add('active');
    document.getElementById('dashboard-section').classList.remove('active');
}

function showDashboard() {
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('dashboard-section').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            authToken = data.token;
            localStorage.setItem('admin_token', authToken);
            isLoggedIn = true;
            showDashboard();
            loadDashboardData();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Connection error. Please check if the backend server is running.', 'error');
    }
}

async function loadDashboardData() {
    if (!authToken) return;
    
    try {
        // Load overview stats
        const [ordersRes, usersRes, paymentsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).catch(() => null),
            fetch(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).catch(() => null),
            fetch(`${API_BASE_URL}/payments`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).catch(() => null),
        ]);
        
        if (ordersRes && ordersRes.ok) {
            const orders = await ordersRes.json();
            const totalOrders = orders.data?.length || 0;
            const pendingOrders = orders.data?.filter(o => o.status === 'PENDING').length || 0;
            document.getElementById('total-orders').textContent = totalOrders;
            document.getElementById('pending-orders').textContent = pendingOrders;
        }
        
        if (usersRes && usersRes.ok) {
            const users = await usersRes.json();
            document.getElementById('total-users').textContent = users.data?.length || 0;
        }
        
        if (paymentsRes && paymentsRes.ok) {
            const payments = await paymentsRes.json();
            const totalRevenue = payments.data?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0;
            document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadTabData(tabName) {
    if (!authToken) return;
    
    try {
        switch (tabName) {
            case 'products':
                await loadProducts();
                break;
            case 'orders':
                await loadOrders();
                break;
            case 'payments':
                await loadPayments();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'dealers':
                await loadDealers();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${tabName} data:`, error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const products = data.data || [];
            const tbody = document.getElementById('products-table-body');
            
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">No products found</td></tr>';
                return;
            }
            
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.id.substring(0, 8)}...</td>
                    <td>${product.name}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>$${product.price || '0.00'}</td>
                    <td>${product.stockQuantity || 0}</td>
                    <td>
                        <button class="btn-admin btn-admin-secondary" onclick="editProduct('${product.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-admin btn-admin-secondary" onclick="deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('products-table-body').innerHTML = 
                '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Error loading products</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-table-body').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Connection error</td></tr>';
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const orders = data.data || [];
            const tbody = document.getElementById('orders-table-body');
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">No orders found</td></tr>';
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.id.substring(0, 8)}...</td>
                    <td>${order.user?.firstName || 'N/A'} ${order.user?.lastName || ''}</td>
                    <td>$${order.totalAmount || '0.00'}</td>
                    <td><span style="padding: 5px 10px; border-radius: 4px; background: ${getStatusColor(order.status)}">${order.status}</span></td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-admin btn-admin-secondary" onclick="viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('orders-table-body').innerHTML = 
                '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Error loading orders</td></tr>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-table-body').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Connection error</td></tr>';
    }
}

async function loadPayments() {
    try {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const payments = data.data || [];
            const tbody = document.getElementById('payments-table-body');
            
            if (payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-gray);">No payments found</td></tr>';
                return;
            }
            
            tbody.innerHTML = payments.map(payment => `
                <tr>
                    <td>${payment.id.substring(0, 8)}...</td>
                    <td>${payment.orderId ? payment.orderId.substring(0, 8) + '...' : 'N/A'}</td>
                    <td>$${payment.amount || '0.00'}</td>
                    <td>${payment.method || 'N/A'}</td>
                    <td><span style="padding: 5px 10px; border-radius: 4px; background: ${getStatusColor(payment.status)}">${payment.status}</span></td>
                    <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-admin btn-admin-secondary" onclick="viewPayment('${payment.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('payments-table-body').innerHTML = 
                '<tr><td colspan="7" style="text-align: center; color: var(--text-gray);">Error loading payments</td></tr>';
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        document.getElementById('payments-table-body').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; color: var(--text-gray);">Connection error</td></tr>';
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const users = data.data || [];
            const tbody = document.getElementById('users-table-body');
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">No users found</td></tr>';
                return;
            }
            
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id.substring(0, 8)}...</td>
                    <td>${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${user.role || 'CUSTOMER'}</td>
                    <td><span style="padding: 5px 10px; border-radius: 4px; background: ${user.isActive ? '#28a745' : '#dc3545'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <button class="btn-admin btn-admin-secondary" onclick="viewUser('${user.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('users-table-body').innerHTML = 
                '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Error loading users</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Connection error</td></tr>';
    }
}

async function loadDealers() {
    try {
        const response = await fetch(`${API_BASE_URL}/dealers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const dealers = data.data || [];
            const tbody = document.getElementById('dealers-table-body');
            
            if (dealers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">No dealers found</td></tr>';
                return;
            }
            
            tbody.innerHTML = dealers.map(dealer => `
                <tr>
                    <td>${dealer.id.substring(0, 8)}...</td>
                    <td>${dealer.companyName || 'N/A'}</td>
                    <td>${dealer.contactEmail || 'N/A'}</td>
                    <td><span style="padding: 5px 10px; border-radius: 4px; background: ${getStatusColor(dealer.status)}">${dealer.status || 'PENDING'}</span></td>
                    <td>$${dealer.currentBalance || '0.00'}</td>
                    <td>
                        <button class="btn-admin btn-admin-secondary" onclick="viewDealer('${dealer.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('dealers-table-body').innerHTML = 
                '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Error loading dealers</td></tr>';
        }
    } catch (error) {
        console.error('Error loading dealers:', error);
        document.getElementById('dealers-table-body').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: var(--text-gray);">Connection error</td></tr>';
    }
}

function getStatusColor(status) {
    const colors = {
        'PENDING': '#ffc107',
        'COMPLETED': '#28a745',
        'PROCESSING': '#17a2b8',
        'CANCELLED': '#dc3545',
        'APPROVED': '#28a745',
        'REJECTED': '#dc3545',
    };
    return colors[status] || '#6c757d';
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Placeholder functions for actions
function showAddProductModal() {
    showNotification('Add Product feature coming soon!', 'success');
}

function editProduct(id) {
    showNotification(`Edit product ${id.substring(0, 8)}...`, 'success');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        showNotification(`Delete product ${id.substring(0, 8)}...`, 'success');
    }
}

function viewOrder(id) {
    showNotification(`View order ${id.substring(0, 8)}...`, 'success');
}

function viewPayment(id) {
    showNotification(`View payment ${id.substring(0, 8)}...`, 'success');
}

function viewUser(id) {
    showNotification(`View user ${id.substring(0, 8)}...`, 'success');
}

function viewDealer(id) {
    showNotification(`View dealer ${id.substring(0, 8)}...`, 'success');
}

// Export functions for onclick handlers
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewOrder = viewOrder;
window.viewPayment = viewPayment;
window.viewUser = viewUser;
window.viewDealer = viewDealer;

