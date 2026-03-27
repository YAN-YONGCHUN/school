const { handleOptions, parseBody, sendSuccess, sendError, setCorsHeaders } = require('./lib/utils');
const { getData, findItem, addItem } = require('./lib/db');
const { generateToken } = require('./lib/auth');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const { httpMethod: method, path, body: rawBody, headers: eventHeaders } = event;
    
    try {
        if (method === 'POST' && path.includes('auth/register')) {
            const body = JSON.parse(rawBody);
            const { name, phone, password, email } = body;

            if (!name || !phone || !password) {
                return sendError({ statusCode: 400, headers }, '请填写完整信息');
            }

            if (!/^1[3-9]\d{9}$/.test(phone)) {
                return sendError({ statusCode: 400, headers }, '请输入正确的手机号');
            }

            const existingUser = findItem('users', 'phone', phone);
            if (existingUser) {
                return sendError({ statusCode: 400, headers }, '该手机号已注册');
            }

            const newUser = addItem('users', {
                name,
                phone,
                password,
                email: email || `${phone}@example.com`,
                status: 'active',
                registerTime: new Date().toLocaleDateString(),
                climbCount: 0
            });

            const token = generateToken({ id: newUser.id, phone: newUser.phone, name: newUser.name });
            
            return sendSuccess({ statusCode: 200, headers }, { 
                user: { id: newUser.id, name: newUser.name, phone: newUser.phone },
                token 
            }, '注册成功');
        }

        if (method === 'POST' && path.includes('auth/login')) {
            const body = JSON.parse(rawBody);
            const { account, password } = body;

            if (!account || !password) {
                return sendError({ statusCode: 400, headers }, '请填写完整信息');
            }

            const user = findItem('users', 'phone', account) || findItem('users', 'email', account);
            
            if (!user || user.password !== password) {
                return sendError({ statusCode: 401, headers }, '账号或密码错误');
            }

            if (user.status === 'inactive') {
                return sendError({ statusCode: 403, headers }, '账户已被禁用');
            }

            const token = generateToken({ id: user.id, phone: user.phone, name: user.name });
            
            return sendSuccess({ statusCode: 200, headers }, { 
                user: { id: user.id, name: user.name, phone: user.phone },
                token 
            }, '登录成功');
        }

        if (method === 'POST' && path.includes('auth/admin/login')) {
            const body = JSON.parse(rawBody);
            const { account, password } = body;

            if (!account || !password) {
                return sendError({ statusCode: 400, headers }, '请填写完整信息');
            }

            const admin = findItem('adminUsers', 'account', account);
            
            if (!admin || admin.password !== password) {
                return sendError({ statusCode: 401, headers }, '账号或密码错误');
            }

            const token = generateToken({ 
                id: admin.id, 
                account: admin.account, 
                name: admin.name, 
                role: admin.role,
                isAdmin: true 
            });
            
            return sendSuccess({ statusCode: 200, headers }, { 
                admin: { id: admin.id, name: admin.name, role: admin.role },
                token 
            }, '登录成功');
        }

        if (method === 'GET' && path.includes('auth/me')) {
            const { extractToken, verifyToken } = require('./lib/auth');
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError({ statusCode: 401, headers }, '未提供认证令牌');
            }
            
            const decoded = verifyToken(token);
            if (!decoded) {
                return sendError({ statusCode: 401, headers }, '令牌无效或已过期');
            }
            
            return sendSuccess({ statusCode: 200, headers }, { user: decoded });
        }

        return sendError({ statusCode: 404, headers }, '未知的认证请求');

    } catch (error) {
        console.error('Auth API Error:', error);
        return sendError({ statusCode: 500, headers }, '服务器错误');
    }
};
