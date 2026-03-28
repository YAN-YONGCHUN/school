// Cloudflare Workers API
// MemSavor 登山共享平台

// CORS 头配置
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
};

// 内存数据存储（生产环境应使用 KV）
let dataStore = {
    users: [],
    adminUsers: [
        { id: '1', account: 'admin', password: 'admin123', name: '管理员', role: 'admin' }
    ],
    mountains: [
        { id: 1, name: '华山', location: '陕西省渭南市', altitude: 2154, difficulty: '困难', rating: 4.8, views: 1256, description: '五岳之一，以险著称', badges: ['险峰', '日出'], isNew: false },
        { id: 2, name: '黄山', location: '安徽省黄山市', altitude: 1864, difficulty: '中等', rating: 4.9, views: 2341, description: '天下第一奇山', badges: ['云海', '奇松'], isNew: false },
        { id: 3, name: '峨眉山', location: '四川省乐山市', altitude: 3099, difficulty: '困难', rating: 4.7, views: 987, description: '四大佛教名山之一', badges: ['佛光', '云海'], isNew: true },
        { id: 4, name: '武夷山', location: '福建省南平市', altitude: 2158, difficulty: '简单', rating: 4.6, views: 654, description: '世界文化与自然双重遗产', badges: ['丹霞', '茶文化'], isNew: false },
        { id: 5, name: '张家界', location: '湖南省张家界市', altitude: 1518, difficulty: '中等', rating: 4.8, views: 1823, description: '奇峰三千，秀水八百', badges: ['奇峰', '玻璃桥'], isNew: true }
    ],
    partners: [],
    partnerApplications: [],
    orders: [],
    products: [],
    rentals: []
};

// JWT 简化版（生产环境应使用真正的 JWT）
function generateToken(payload) {
    return btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
}

function verifyToken(token) {
    try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp < Date.now()) return null;
        return decoded;
    } catch {
        return null;
    }
}

// 工具函数
function sendResponse(data, message = '操作成功') {
    return new Response(JSON.stringify({ success: true, message, data }), {
        status: 200,
        headers: corsHeaders
    });
}

function sendError(message, status = 400) {
    return new Response(JSON.stringify({ success: false, message }), {
        status,
        headers: corsHeaders
    });
}

function parseUrl(url) {
    const urlObj = new URL(url);
    return {
        pathname: urlObj.pathname,
        searchParams: urlObj.searchParams
    };
}

// 主处理函数
export default {
    async fetch(request, env, ctx) {
        // 处理 OPTIONS 预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers: corsHeaders });
        }

        const url = parseUrl(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // ==================== 认证 API ====================
            if (path.includes('/auth/register') && method === 'POST') {
                const body = await request.json();
                const { name, phone, password, email } = body;

                if (!name || !phone || !password) {
                    return sendError('请填写完整信息');
                }

                if (!/^1[3-9]\d{9}$/.test(phone)) {
                    return sendError('请输入正确的手机号');
                }

                const existingUser = dataStore.users.find(u => u.phone === phone);
                if (existingUser) {
                    return sendError('该手机号已注册');
                }

                const newUser = {
                    id: Date.now().toString(),
                    name,
                    phone,
                    password,
                    email: email || `${phone}@example.com`,
                    status: 'active',
                    registerTime: new Date().toLocaleDateString(),
                    climbCount: 0
                };

                dataStore.users.push(newUser);
                const token = generateToken({ id: newUser.id, phone: newUser.phone, name: newUser.name });

                return sendResponse({ user: { id: newUser.id, name: newUser.name, phone: newUser.phone }, token }, '注册成功');
            }

            if (path.includes('/auth/login') && method === 'POST') {
                const body = await request.json();
                const { account, password } = body;

                if (!account || !password) {
                    return sendError('请填写完整信息');
                }

                const user = dataStore.users.find(u => u.phone === account || u.email === account);

                if (!user || user.password !== password) {
                    return sendError('账号或密码错误', 401);
                }

                if (user.status === 'inactive') {
                    return sendError('账户已被禁用', 403);
                }

                const token = generateToken({ id: user.id, phone: user.phone, name: user.name });

                return sendResponse({ user: { id: user.id, name: user.name, phone: user.phone }, token }, '登录成功');
            }

            if (path.includes('/auth/admin/login') && method === 'POST') {
                const body = await request.json();
                const { account, password } = body;

                if (!account || !password) {
                    return sendError('请填写完整信息');
                }

                const admin = dataStore.adminUsers.find(a => a.account === account);

                if (!admin || admin.password !== password) {
                    return sendError('账号或密码错误', 401);
                }

                const token = generateToken({ id: admin.id, account: admin.account, name: admin.name, role: admin.role, isAdmin: true });

                return sendResponse({ admin: { id: admin.id, name: admin.name, role: admin.role }, token }, '登录成功');
            }

            // ==================== 山峰 API ====================
            if (path.includes('/mountains') && method === 'GET') {
                let mountains = [...dataStore.mountains];

                const keyword = url.searchParams.get('keyword');
                const difficulty = url.searchParams.get('difficulty');
                const page = parseInt(url.searchParams.get('page')) || 1;
                const limit = parseInt(url.searchParams.get('limit')) || 10;

                if (keyword) {
                    mountains = mountains.filter(m => m.name.includes(keyword) || m.location.includes(keyword));
                }

                if (difficulty) {
                    mountains = mountains.filter(m => m.difficulty === difficulty);
                }

                const total = mountains.length;
                const start = (page - 1) * limit;
                const paginatedMountains = mountains.slice(start, start + limit);

                return sendResponse({
                    mountains: paginatedMountains,
                    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
                });
            }

            // ==================== 搭子 API ====================
            if (path.includes('/partners') && method === 'GET') {
                let partners = [...dataStore.partners];

                const status = url.searchParams.get('status');
                const page = parseInt(url.searchParams.get('page')) || 1;
                const limit = parseInt(url.searchParams.get('limit')) || 10;

                if (status && status !== 'all') {
                    partners = partners.filter(p => p.status === status);
                }

                const total = partners.length;
                const start = (page - 1) * limit;
                const paginatedPartners = partners.slice(start, start + limit);

                return sendResponse({
                    partners: paginatedPartners,
                    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
                });
            }

            if (path.includes('/partners/my') && method === 'GET') {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return sendError('请先登录', 401);
                }

                const token = authHeader.substring(7);
                const decoded = verifyToken(token);
                if (!decoded) {
                    return sendError('令牌无效', 401);
                }

                const partners = dataStore.partners.filter(p => p.userId === decoded.id);
                return sendResponse({ partners });
            }

            if (path.includes('/partners/applications') && method === 'GET') {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return sendError('请先登录', 401);
                }

                const token = authHeader.substring(7);
                const decoded = verifyToken(token);
                if (!decoded) {
                    return sendError('令牌无效', 401);
                }

                const applications = dataStore.partnerApplications.filter(a => a.leaderId === decoded.id);
                return sendResponse({ applications });
            }

            if (path.includes('/partners') && method === 'POST') {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return sendError('请先登录', 401);
                }

                const token = authHeader.substring(7);
                const decoded = verifyToken(token);
                if (!decoded) {
                    return sendError('令牌无效', 401);
                }

                const body = await request.json();
                const { route, date, total, difficulty, description } = body;

                if (!route || !date) {
                    return sendError('请填写完整信息');
                }

                const newPartner = {
                    id: Date.now(),
                    name: decoded.name,
                    userId: decoded.id,
                    route,
                    date,
                    total: parseInt(total) || 2,
                    need: (parseInt(total) || 2) - 1,
                    difficulty: difficulty || '中等',
                    description: description || '',
                    createTime: new Date().toLocaleDateString(),
                    status: 'recruiting'
                };

                dataStore.partners.push(newPartner);
                return sendResponse({ partner: newPartner }, '发布成功');
            }

            // ==================== 用户 API ====================
            if (path.includes('/users') && method === 'GET') {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return sendError('请先登录', 401);
                }

                const token = authHeader.substring(7);
                const decoded = verifyToken(token);
                if (!decoded || !decoded.isAdmin) {
                    return sendError('无权限操作', 403);
                }

                let users = [...dataStore.users];

                const keyword = url.searchParams.get('keyword');
                const status = url.searchParams.get('status');
                const page = parseInt(url.searchParams.get('page')) || 1;
                const limit = parseInt(url.searchParams.get('limit')) || 10;

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

                return sendResponse({
                    users: paginatedUsers,
                    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
                });
            }

            // 404 - 未找到
            return sendError('未找到 API 端点', 404);

        } catch (error) {
            console.error('API Error:', error);
            return sendError('服务器错误: ' + error.message, 500);
        }
    }
};
