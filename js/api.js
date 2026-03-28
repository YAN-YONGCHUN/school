// Cloudflare Workers API 配置
// 部署后请更新为您的 Workers 地址
// 格式：https://your-worker-name.your-subdomain.workers.dev
const API_BASE_URL = 'https://memsavor-api.YOUR-SUBDOMAIN.workers.dev';

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
            const errorMsg = data.message || '请求失败';
            throw new Error(errorMsg);
        }
        
        return data;
    } catch (error) {
        console.error('API 错误:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('网络连接失败，请检查网络');
        }
        throw error;
    }
}

const api = {
    getToken,
    setToken,
    removeToken,

    async login(account, password) {
        try {
            const data = await request('/auth/login', {
                method: 'POST',
                body: { account, password }
            });
            
            if (data.success) {
                setToken(data.data.token);
                localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
            }
            
            return data;
        } catch (error) {
            throw new Error(error.message || '登录失败，请重试');
        }
    },

    async register(name, phone, password, email) {
        try {
            const data = await request('/auth/register', {
                method: 'POST',
                body: { name, phone, password, email }
            });
            
            if (data.success) {
                setToken(data.data.token);
                localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
            }
            
            return data;
        } catch (error) {
            throw new Error(error.message || '注册失败，请重试');
        }
    },

    async adminLogin(account, password) {
        try {
            const data = await request('/auth/admin/login', {
                method: 'POST',
                body: { account, password }
            });
            
            if (data.success) {
                setToken(data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
            }
            
            return data;
        } catch (error) {
            throw new Error(error.message || '管理员登录失败');
        }
    },

    logout() {
        removeToken();
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('adminUser');
    },

    async getMountains(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/mountains${query ? '?' + query : ''}`);
    },

    async getMountain(id) {
        return request(`/mountains/${id}`);
    },

    async createMountain(data) {
        return request('/mountains', {
            method: 'POST',
            body: data
        });
    },

    async updateMountain(id, data) {
        return request(`/mountains/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteMountain(id) {
        return request(`/mountains/${id}`, {
            method: 'DELETE'
        });
    },

    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/users${query ? '?' + query : ''}`);
    },

    async createUser(data) {
        return request('/users', {
            method: 'POST',
            body: data
        });
    },

    async updateUser(phone, data) {
        return request(`/users/${phone}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteUser(phone) {
        return request(`/users/${phone}`, {
            method: 'DELETE'
        });
    },

    async getOrders(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/orders${query ? '?' + query : ''}`);
    },

    async createOrder(data) {
        return request('/orders', {
            method: 'POST',
            body: data
        });
    },

    async updateOrder(id, data) {
        return request(`/orders/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async getRentals(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/rentals${query ? '?' + query : ''}`);
    },

    async createRental(data) {
        return request('/rentals', {
            method: 'POST',
            body: data
        });
    },

    async returnRental(id, data) {
        return request(`/rentals/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async getPartners(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/partners${query ? '?' + query : ''}`);
    },

    async getMyPartners() {
        return request('/partners/my');
    },

    async getPartnerApplications() {
        return request('/partners/applications');
    },

    async createPartner(data) {
        return request('/partners', {
            method: 'POST',
            body: data
        });
    },

    async applyPartner(partnerId, message) {
        return request('/partners/apply', {
            method: 'POST',
            body: { partnerId, message }
        });
    },

    async approveApplication(appId) {
        return request(`/partners/applications/${appId}/approve`, {
            method: 'POST'
        });
    },

    async rejectApplication(appId) {
        return request(`/partners/applications/${appId}/reject`, {
            method: 'POST'
        });
    },

    async updatePartner(id, data) {
        return request(`/partners/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deletePartner(id) {
        return request(`/partners/${id}`, {
            method: 'DELETE'
        });
    },

    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/products${query ? '?' + query : ''}`);
    },

    async getProduct(id) {
        return request(`/products/${id}`);
    },

    async createProduct(data) {
        return request('/products', {
            method: 'POST',
            body: data
        });
    },

    async updateProduct(id, data) {
        return request(`/products/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    async deleteProduct(id) {
        return request(`/products/${id}`, {
            method: 'DELETE'
        });
    }
};

window.api = api;
