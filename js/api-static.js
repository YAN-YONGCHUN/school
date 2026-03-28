// 纯静态版本 API - 完全基于 localStorage
// 无需后端，可直接在 GitHub Pages 运行

const TOKEN_KEY = 'memsavor_token';
const USER_KEY = 'currentUser';

// ==================== 数据存储 ====================

// 初始化默认数据
function initDataStore() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            {
                id: '1',
                name: '登山爱好者',
                phone: '13800138000',
                email: 'demo@example.com',
                password: '123456',
                status: 'active',
                registerTime: '2024-01-01',
                climbCount: 10
            }
        ]));
    }

    if (!localStorage.getItem('adminUsers')) {
        localStorage.setItem('adminUsers', JSON.stringify([
            { id: '1', account: 'admin', password: 'admin123', name: '管理员', role: 'admin' }
        ]));
    }

    if (!localStorage.getItem('mountains')) {
        localStorage.setItem('mountains', JSON.stringify([
            { id: 1, name: '华山', location: '陕西省渭南市', altitude: 2154, difficulty: '困难', rating: 4.8, views: 1256, description: '五岳之一，以险著称', badges: ['险峰', '日出'], isNew: false },
            { id: 2, name: '黄山', location: '安徽省黄山市', altitude: 1864, difficulty: '中等', rating: 4.9, views: 2341, description: '天下第一奇山', badges: ['云海', '奇松'], isNew: false },
            { id: 3, name: '峨眉山', location: '四川省乐山市', altitude: 3099, difficulty: '困难', rating: 4.7, views: 987, description: '四大佛教名山之一', badges: ['佛光', '云海'], isNew: true },
            { id: 4, name: '武夷山', location: '福建省南平市', altitude: 2158, difficulty: '简单', rating: 4.6, views: 654, description: '世界文化与自然双重遗产', badges: ['丹霞', '茶文化'], isNew: false },
            { id: 5, name: '张家界', location: '湖南省张家界市', altitude: 1518, difficulty: '中等', rating: 4.8, views: 1823, description: '奇峰三千，秀水八百', badges: ['奇峰', '玻璃桥'], isNew: true }
        ]));
    }

    if (!localStorage.getItem('partners')) {
        localStorage.setItem('partners', JSON.stringify([]));
    }

    if (!localStorage.getItem('partnerApplications')) {
        localStorage.setItem('partnerApplications', JSON.stringify([]));
    }

    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }

    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([
            { id: 1, name: '登山徽章', category: '徽章', price: 29, stock: 100, sales: 45, badge: '热销', desc: '精美金属徽章', status: 'active' },
            { id: 2, name: '速干T恤', category: '服饰', price: 99, stock: 50, sales: 32, badge: '新品', desc: '透气速干面料', status: 'active' },
            { id: 3, name: '登山背包', category: '周边', price: 199, stock: 30, sales: 18, badge: '', desc: '大容量专业登山包', status: 'active' }
        ]));
    }

    if (!localStorage.getItem('rentals')) {
        localStorage.setItem('rentals', JSON.stringify([]));
    }
}

// 初始化数据
initDataStore();

// ==================== 工具函数 ====================

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString();
}

function generateToken(payload) {
    const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    return btoa(encodeURIComponent(data));
}

function verifyToken(token) {
    try {
        const decoded = JSON.parse(decodeURIComponent(atob(token)));
        if (decoded.exp < Date.now()) return null;
        return decoded;
    } catch {
        return null;
    }
}

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
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ==================== API 实现 ====================

const api = {
    getToken,
    setToken,
    removeToken,

    // 认证 API
    async login(account, password) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const users = getData('users');
        const user = users.find(u => u.phone === account || u.email === account);
        
        if (!user || user.password !== password) {
            throw new Error('账号或密码错误');
        }

        if (user.status === 'inactive') {
            throw new Error('账户已被禁用');
        }

        const token = generateToken({ id: user.id, phone: user.phone, name: user.name });
        setToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify({ id: user.id, name: user.name, phone: user.phone }));

        return {
            success: true,
            message: '登录成功',
            data: {
                user: { id: user.id, name: user.name, phone: user.phone },
                token
            }
        };
    },

    async register(name, phone, password, email) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!name || !phone || !password) {
            throw new Error('请填写完整信息');
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            throw new Error('请输入正确的手机号');
        }

        const users = getData('users');
        if (users.find(u => u.phone === phone)) {
            throw new Error('该手机号已注册');
        }

        const newUser = {
            id: generateId(),
            name,
            phone,
            password,
            email: email || `${phone}@example.com`,
            status: 'active',
            registerTime: new Date().toLocaleDateString(),
            climbCount: 0
        };

        users.push(newUser);
        setData('users', users);

        const token = generateToken({ id: newUser.id, phone: newUser.phone, name: newUser.name });
        setToken(token);
        localStorage.setItem(USER_KEY, JSON.stringify({ id: newUser.id, name: newUser.name, phone: newUser.phone }));

        return {
            success: true,
            message: '注册成功',
            data: {
                user: { id: newUser.id, name: newUser.name, phone: newUser.phone },
                token
            }
        };
    },

    async adminLogin(account, password) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const adminUsers = getData('adminUsers');
        const admin = adminUsers.find(a => a.account === account);
        
        if (!admin || admin.password !== password) {
            throw new Error('账号或密码错误');
        }

        const token = generateToken({ id: admin.id, account: admin.account, name: admin.name, role: admin.role, isAdmin: true });
        setToken(token);
        localStorage.setItem('adminUser', JSON.stringify({ id: admin.id, name: admin.name, role: admin.role }));

        return {
            success: true,
            message: '登录成功',
            data: {
                admin: { id: admin.id, name: admin.name, role: admin.role },
                token
            }
        };
    },

    logout() {
        removeToken();
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('adminUser');
    },

    // 山峰 API
    async getMountains(params = {}) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let mountains = getData('mountains');
        
        const { keyword, difficulty, page = 1, limit = 10 } = params;

        if (keyword) {
            mountains = mountains.filter(m => m.name.includes(keyword) || m.location.includes(keyword));
        }

        if (difficulty) {
            mountains = mountains.filter(m => m.difficulty === difficulty);
        }

        const total = mountains.length;
        const start = (page - 1) * limit;
        const paginatedMountains = mountains.slice(start, start + limit);

        return {
            success: true,
            data: {
                mountains: paginatedMountains,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    },

    async getMountain(id) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const mountains = getData('mountains');
        const mountain = mountains.find(m => m.id === parseInt(id));
        
        if (!mountain) {
            throw new Error('山峰不存在');
        }

        mountain.views = (mountain.views || 0) + 1;
        setData('mountains', mountains);

        return { success: true, data: { mountain } };
    },

    async createMountain(data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const mountains = getData('mountains');
        const newMountain = {
            id: mountains.length + 1,
            ...data,
            views: 0,
            isNew: true
        };
        
        mountains.push(newMountain);
        setData('mountains', mountains);

        return { success: true, data: { mountain: newMountain }, message: '添加成功' };
    },

    async updateMountain(id, data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const mountains = getData('mountains');
        const index = mountains.findIndex(m => m.id === parseInt(id));
        
        if (index === -1) throw new Error('山峰不存在');

        mountains[index] = { ...mountains[index], ...data };
        setData('mountains', mountains);

        return { success: true, data: { mountain: mountains[index] }, message: '更新成功' };
    },

    async deleteMountain(id) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const mountains = getData('mountains');
        const index = mountains.findIndex(m => m.id === parseInt(id));
        
        if (index === -1) throw new Error('山峰不存在');

        mountains.splice(index, 1);
        setData('mountains', mountains);

        return { success: true, message: '删除成功' };
    },

    // 用户 API
    async getUsers(params = {}) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        let users = getData('users');
        
        const { keyword, status, page = 1, limit = 10 } = params;

        if (keyword) {
            users = users.filter(u => u.name.includes(keyword) || u.phone.includes(keyword));
        }

        if (status && status !== 'all') {
            users = users.filter(u => u.status === status);
        }

        const total = users.length;
        const start = (page - 1) * limit;
        const paginatedUsers = users.slice(start, start + limit).map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });

        return {
            success: true,
            data: {
                users: paginatedUsers,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    },

    async createUser(data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const users = getData('users');
        if (users.find(u => u.phone === data.phone)) {
            throw new Error('该手机号已存在');
        }

        const newUser = {
            id: generateId(),
            ...data,
            registerTime: new Date().toLocaleDateString(),
            climbCount: 0
        };

        users.push(newUser);
        setData('users', users);

        const { password, ...userWithoutPassword } = newUser;
        return { success: true, data: { user: userWithoutPassword }, message: '添加成功' };
    },

    async updateUser(phone, data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const users = getData('users');
        const index = users.findIndex(u => u.phone === phone);
        
        if (index === -1) throw new Error('用户不存在');

        users[index] = { ...users[index], ...data };
        setData('users', users);

        const { password, ...userWithoutPassword } = users[index];
        return { success: true, data: { user: userWithoutPassword }, message: '更新成功' };
    },

    async deleteUser(phone) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const users = getData('users');
        const index = users.findIndex(u => u.phone === phone);
        
        if (index === -1) throw new Error('用户不存在');

        users.splice(index, 1);
        setData('users', users);

        return { success: true, message: '删除成功' };
    },

    // 搭子 API
    async getPartners(params = {}) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let partners = getData('partners');
        
        const { status, page = 1, limit = 10 } = params;

        if (status && status !== 'all') {
            partners = partners.filter(p => p.status === status);
        }

        const total = partners.length;
        const start = (page - 1) * limit;
        const paginatedPartners = partners.slice(start, start + limit);

        return {
            success: true,
            data: {
                partners: paginatedPartners,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    },

    async getMyPartners() {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const partners = getData('partners').filter(p => p.userId === decoded.id);
        return { success: true, data: { partners } };
    },

    async getPartnerApplications() {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const applications = getData('partnerApplications').filter(a => a.leaderId === decoded.id);
        const applicants = [];
        
        for (const app of applications) {
            const users = getData('users');
            const user = users.find(u => u.id === app.applicantId);
            const partners = getData('partners');
            const partner = partners.find(p => p.id === app.partnerId);
            if (user && partner) {
                applicants.push({
                    ...app,
                    applicantName: user.name,
                    applicantPhone: user.phone,
                    partnerRoute: partner.route
                });
            }
        }
        
        return { success: true, data: { applications: applicants } };
    },

    async createPartner(data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const partners = getData('partners');
        const newPartner = {
            id: partners.length + 1,
            name: decoded.name,
            userId: decoded.id,
            ...data,
            total: parseInt(data.total) || 2,
            need: (parseInt(data.total) || 2) - 1,
            createTime: new Date().toLocaleDateString(),
            status: 'recruiting'
        };

        partners.push(newPartner);
        setData('partners', partners);

        return { success: true, data: { partner: newPartner }, message: '发布成功' };
    },

    async applyPartner(partnerId, message) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const partners = getData('partners');
        const partner = partners.find(p => p.id === parseInt(partnerId));
        
        if (!partner) throw new Error('招募信息不存在');
        if (partner.need <= 0) throw new Error('该队伍已满员');

        const applications = getData('partnerApplications');
        if (applications.find(a => a.partnerId == partnerId && a.applicantId === decoded.id)) {
            throw new Error('您已申请过，请等待审核');
        }

        const application = {
            id: applications.length + 1,
            partnerId: parseInt(partnerId),
            applicantId: decoded.id,
            applicantName: decoded.name,
            leaderId: partner.userId,
            message: message || '',
            status: 'pending',
            createTime: new Date().toLocaleString()
        };

        applications.push(application);
        setData('partnerApplications', applications);

        return { success: true, data: { application }, message: '申请已提交，请等待队长审核' };
    },

    async approveApplication(appId) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const applications = getData('partnerApplications');
        const app = applications.find(a => a.id === parseInt(appId));
        
        if (!app) throw new Error('申请不存在');
        if (app.leaderId !== decoded.id) throw new Error('无权限操作');

        const partners = getData('partners');
        const partner = partners.find(p => p.id === app.partnerId);
        
        if (!partner || partner.need <= 0) throw new Error('队伍已满员');

        app.status = 'approved';
        partner.need -= 1;
        
        if (partner.need <= 0) {
            partner.status = 'full';
        }

        setData('partnerApplications', applications);
        setData('partners', partners);

        return { success: true, message: '已同意申请' };
    },

    async rejectApplication(appId) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const applications = getData('partnerApplications');
        const app = applications.find(a => a.id === parseInt(appId));
        
        if (!app) throw new Error('申请不存在');
        if (app.leaderId !== decoded.id) throw new Error('无权限操作');

        app.status = 'rejected';
        setData('partnerApplications', applications);

        return { success: true, message: '已拒绝申请' };
    },

    async updatePartner(id, data) {
        const partners = getData('partners');
        const index = partners.findIndex(p => p.id === parseInt(id));
        
        if (index === -1) throw new Error('招募信息不存在');

        partners[index] = { ...partners[index], ...data };
        setData('partners', partners);

        return { success: true, data: { partner: partners[index] }, message: '更新成功' };
    },

    async deletePartner(id) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const partners = getData('partners');
        const index = partners.findIndex(p => p.id === parseInt(id));
        
        if (index === -1) throw new Error('招募信息不存在');

        partners.splice(index, 1);
        setData('partners', partners);

        return { success: true, message: '删除成功' };
    },

    // 订单 API
    async getOrders(params = {}) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        let orders = getData('orders');
        
        const { status, page = 1, limit = 10 } = params;

        if (status && status !== 'all') {
            orders = orders.filter(o => o.status === status);
        }

        if (!decoded.isAdmin) {
            orders = orders.filter(o => o.userId === decoded.id);
        }

        const total = orders.length;
        const start = (page - 1) * limit;
        const paginatedOrders = orders.slice(start, start + limit);

        return {
            success: true,
            data: {
                orders: paginatedOrders,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    },

    async createOrder(data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const orders = getData('orders');
        const newOrder = {
            id: 'ORD' + Date.now().toString().slice(-6),
            userId: decoded.id,
            ...data,
            time: new Date().toLocaleString(),
            status: 'pending'
        };

        orders.push(newOrder);
        setData('orders', orders);

        return { success: true, data: { order: newOrder }, message: '下单成功' };
    },

    async updateOrder(id, data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const orders = getData('orders');
        const index = orders.findIndex(o => o.id === id);
        
        if (index === -1) throw new Error('订单不存在');

        orders[index] = { ...orders[index], ...data };
        setData('orders', orders);

        return { success: true, data: { order: orders[index] }, message: '更新成功' };
    },

    // 商品 API
    async getProducts(params = {}) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let products = getData('products');
        
        const { category, page = 1, limit = 10 } = params;

        if (category && category !== 'all') {
            products = products.filter(p => p.category === category);
        }

        const total = products.length;
        const start = (page - 1) * limit;
        const paginatedProducts = products.slice(start, start + limit);

        return {
            success: true,
            data: {
                products: paginatedProducts,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    },

    async getProduct(id) {
        const products = getData('products');
        const product = products.find(p => p.id === parseInt(id));
        
        if (!product) throw new Error('商品不存在');

        return { success: true, data: { product } };
    },

    async createProduct(data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const products = getData('products');
        const newProduct = {
            id: products.length + 1,
            ...data,
            sales: 0,
            status: 'active'
        };

        products.push(newProduct);
        setData('products', products);

        return { success: true, data: { product: newProduct }, message: '添加成功' };
    },

    async updateProduct(id, data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const products = getData('products');
        const index = products.findIndex(p => p.id === parseInt(id));
        
        if (index === -1) throw new Error('商品不存在');

        products[index] = { ...products[index], ...data };
        setData('products', products);

        return { success: true, data: { product: products[index] }, message: '更新成功' };
    },

    async deleteProduct(id) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) throw new Error('无权限操作');

        const products = getData('products');
        const index = products.findIndex(p => p.id === parseInt(id));
        
        if (index === -1) throw new Error('商品不存在');

        products.splice(index, 1);
        setData('products', products);

        return { success: true, message: '删除成功' };
    },

    // 租借 API
    async getRentals(params = {}) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        let rentals = getData('rentals');
        
        const { status, page = 1, limit = 10 } = params;

        if (status && status !== 'all') {
            rentals = rentals.filter(r => r.status === status);
        }

        const total = rentals.length;
        const start = (page - 1) * limit;
        const paginatedRentals = rentals.slice(start, start + limit);

        return {
            success: true,
            data: {
                rentals: paginatedRentals,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        };
    },

    async createRental(data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const rentals = getData('rentals');
        const newRental = {
            id: Date.now(),
            userId: decoded.id,
            ...data,
            time: new Date().toLocaleString(),
            duration: '进行中',
            status: 'active'
        };

        rentals.push(newRental);
        setData('rentals', rentals);

        return { success: true, data: { rental: newRental }, message: '租借成功' };
    },

    async returnRental(id, data) {
        const token = getToken();
        if (!token) throw new Error('请先登录');
        
        const decoded = verifyToken(token);
        if (!decoded) throw new Error('令牌无效');

        const rentals = getData('rentals');
        const index = rentals.findIndex(r => r.id === parseInt(id));
        
        if (index === -1) throw new Error('租借记录不存在');

        rentals[index] = { ...rentals[index], ...data, status: 'done' };
        setData('rentals', rentals);

        return { success: true, data: { rental: rentals[index] }, message: '归还成功' };
    }
};

window.api = api;
