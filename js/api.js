const API_BASE_URL = 'https://lvxing-pi.vercel.app';

const TOKEN_KEY = 'memsavor_token';
const USER_KEY = 'currentUser';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

const api = {
    getToken,
    setToken,
    removeToken,

    async login(account, password) {
        const data = await request('/api/auth/login', {
            method: 'POST',
            body: { account, password }
        });
        
        if (data.success) {
            setToken(data.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        }
        
        return data;
    },

    async register(name, phone, password, email) {
        const data = await request('/api/auth/register', {
            method: 'POST',
            body: { name, phone, password, email }
        });
        
        if (data.success) {
            setToken(data.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        }
        
        return data;
    },

    async adminLogin(account, password) {
        const data = await request('/api/auth/admin/login', {
            method: 'POST',
            body: { account, password }
        });
        
        if (data.success) {
            setToken(data.data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
        }
        
        return data;
    },

    logout() {
        removeToken();
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('adminUser');
    },

    async getMountains(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/api/mountains${query ? '?' + query : ''}`);
    },

    async getMountain(id) {
        return request(`/api/mountains/${id}`);
    },

    async createMountain(data) {
        return request('/api/mountains', {
            method: 'POST',
            body: data
        });
    },

    async updateMountain(id, data) {
        return request(`/api/mountains/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteMountain(id) {
        return request(`/api/mountains/${id}`, {
            method: 'DELETE'
        });
    },

    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/api/users${query ? '?' + query : ''}`);
    },

    async createUser(data) {
        return request('/api/users', {
            method: 'POST',
            body: data
        });
    },

    async updateUser(phone, data) {
        return request(`/api/users/${phone}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteUser(phone) {
        return request(`/api/users/${phone}`, {
            method: 'DELETE'
        });
    },

    async getOrders(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/api/orders${query ? '?' + query : ''}`);
    },

    async createOrder(data) {
        return request('/api/orders', {
            method: 'POST',
            body: data
        });
    },

    async updateOrder(id, data) {
        return request(`/api/orders/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async getRentals(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/api/rentals${query ? '?' + query : ''}`);
    },

    async createRental(data) {
        return request('/api/rentals', {
            method: 'POST',
            body: data
        });
    },

    async returnRental(id, data) {
        return request(`/api/rentals/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async getPartners(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/api/partners${query ? '?' + query : ''}`);
    },

    async getMyPartners() {
        return request('/api/partners/my');
    },

    async getPartnerApplications() {
        return request('/api/partners/applications');
    },

    async createPartner(data) {
        return request('/api/partners', {
            method: 'POST',
            body: data
        });
    },

    async applyPartner(partnerId, message) {
        return request('/api/partners/apply', {
            method: 'POST',
            body: { partnerId, message }
        });
    },

    async approveApplication(appId) {
        return request(`/api/partners/applications/${appId}/approve`, {
            method: 'POST'
        });
    },

    async rejectApplication(appId) {
        return request(`/api/partners/applications/${appId}/reject`, {
            method: 'POST'
        });
    },

    async updatePartner(id, data) {
        return request(`/api/partners/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deletePartner(id) {
        return request(`/api/partners/${id}`, {
            method: 'DELETE'
        });
    },

    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/api/products${query ? '?' + query : ''}`);
    },

    async getProduct(id) {
        return request(`/api/products/${id}`);
    },

    async createProduct(data) {
        return request('/api/products', {
            method: 'POST',
            body: data
        });
    },

    async updateProduct(id, data) {
        return request(`/api/products/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteProduct(id) {
        return request(`/api/products/${id}`, {
            method: 'DELETE'
        });
    }
};

window.api = api;
