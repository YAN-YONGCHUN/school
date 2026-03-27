const { sendResponse, sendError } = require('./lib/utils');
const { getData, findItem, addItem, updateItem, deleteItem } = require('./lib/db');
const { verifyToken, extractToken } = require('./lib/auth');

exports.handler = async (event, context) => {
    const { httpMethod: method, path, body: rawBody, headers: eventHeaders } = event;

    if (method === 'OPTIONS') {
        return { statusCode: 200, headers: require('./lib/utils').headers, body: '' };
    }

    const url = new URL(path, 'http://localhost');
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    try {
        if (method === 'GET' && pathname.includes('/users') && !pathname.match(/\/users\/[^/]+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            let users = getData('users');
            
            const keyword = searchParams.get('keyword');
            const status = searchParams.get('status');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            if (keyword) {
                users = users.filter(u => 
                    (u.name && u.name.includes(keyword)) || 
                    (u.phone && u.phone.includes(keyword))
                );
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

            return sendResponse(200, {
                users: paginatedUsers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

        if (method === 'GET' && pathname.match(/\/users\/[^/]+$/)) {
            const phone = pathname.split('/').pop();
            const user = findItem('users', 'phone', phone);
            
            if (!user) {
                return sendError(404, '用户不存在');
            }

            const { password, ...userWithoutPassword } = user;
            return sendResponse(200, { user: userWithoutPassword });
        }

        if (method === 'POST' && pathname.includes('/users') && !pathname.match(/\/users\/[^/]+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            const body = JSON.parse(rawBody);
            const { name, phone, email, password, status } = body;

            if (!name || !phone) {
                return sendError(400, '请填写完整信息');
            }

            if (findItem('users', 'phone', phone)) {
                return sendError(400, '该手机号已存在');
            }

            const newUser = addItem('users', {
                name,
                phone,
                email: email || `${phone}@example.com`,
                password: password || '123456',
                status: status || 'active',
                registerTime: new Date().toLocaleDateString(),
                climbCount: 0
            });

            const { password: pwd, ...userWithoutPassword } = newUser;
            return sendResponse(200, { user: userWithoutPassword }, '添加成功');
        }

        if (method === 'PUT' && pathname.match(/\/users\/[^/]+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            const phone = pathname.split('/').pop();
            const body = JSON.parse(rawBody);
            
            const user = findItem('users', 'phone', phone);
            if (!user) {
                return sendError(404, '用户不存在');
            }

            const updated = updateItem('users', user.id, body);
            const { password, ...userWithoutPassword } = updated;

            return sendResponse(200, { user: userWithoutPassword }, '更新成功');
        }

        if (method === 'DELETE' && pathname.match(/\/users\/[^/]+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            const phone = pathname.split('/').pop();
            const user = findItem('users', 'phone', phone);
            
            if (!user) {
                return sendError(404, '用户不存在');
            }

            deleteItem('users', user.id);
            return sendResponse(200, {}, '删除成功');
        }

        return sendError(404, '未知的用户请求');

    } catch (error) {
        console.error('Users API Error:', error);
        return sendError(500, '服务器错误');
    }
};
