const { handleOptions, parseBody, sendSuccess, sendError, setCorsHeaders } = require('../lib/utils');
const { getData, findItem, addItem } = require('../lib/db');
const { generateToken } = require('../lib/auth');

module.exports = async (req, res) => {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method } = req;
    const url = req.url;
    const pathname = url.split('?')[0];

    try {
        if (method === 'POST' && pathname.includes('/auth/register')) {
            const body = await parseBody(req);
            const { name, phone, password, email } = body;

            if (!name || !phone || !password) {
                return sendError(res, '请填写完整信息');
            }

            if (!/^1[3-9]\d{9}$/.test(phone)) {
                return sendError(res, '请输入正确的手机号');
            }

            const existingUser = findItem('users', 'phone', phone);
            if (existingUser) {
                return sendError(res, '该手机号已注册');
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
            
            return sendSuccess(res, { 
                user: { id: newUser.id, name: newUser.name, phone: newUser.phone },
                token 
            }, '注册成功');
        }

        if (method === 'POST' && pathname.includes('/auth/login')) {
            const body = await parseBody(req);
            const { account, password } = body;

            if (!account || !password) {
                return sendError(res, '请填写完整信息');
            }

            const user = findItem('users', 'phone', account) || findItem('users', 'email', account);
            
            if (!user || user.password !== password) {
                return sendError(res, '账号或密码错误');
            }

            if (user.status === 'inactive') {
                return sendError(res, '账户已被禁用');
            }

            const token = generateToken({ id: user.id, phone: user.phone, name: user.name });
            
            return sendSuccess(res, { 
                user: { id: user.id, name: user.name, phone: user.phone },
                token 
            }, '登录成功');
        }

        if (method === 'POST' && pathname.includes('/auth/admin/login')) {
            const body = await parseBody(req);
            const { account, password } = body;

            if (!account || !password) {
                return sendError(res, '请填写完整信息');
            }

            const admin = findItem('adminUsers', 'account', account);
            
            if (!admin || admin.password !== password) {
                return sendError(res, '账号或密码错误');
            }

            const token = generateToken({ 
                id: admin.id, 
                account: admin.account, 
                name: admin.name, 
                role: admin.role,
                isAdmin: true 
            });
            
            return sendSuccess(res, { 
                admin: { id: admin.id, name: admin.name, role: admin.role },
                token 
            }, '登录成功');
        }

        if (method === 'GET' && pathname.includes('/auth/me')) {
            const { authMiddleware } = require('../lib/auth');
            const auth = authMiddleware(req);
            
            if (!auth.valid) {
                return sendError(res, auth.error, 401);
            }
            
            return sendSuccess(res, { user: auth.user });
        }

        return sendError(res, '未知的认证请求', 404);

    } catch (error) {
        console.error('Auth API Error:', error);
        return sendError(res, '服务器错误', 500);
    }
};
