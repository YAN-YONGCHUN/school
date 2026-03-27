const { sendResponse, sendError } = require('./lib/utils');
const { getData, addItem, updateItem, deleteItem } = require('./lib/db');
const { verifyToken } = require('./lib/auth');

exports.handler = async (event, context) => {
    const { httpMethod: method, path, body: rawBody, headers: eventHeaders } = event;

    if (method === 'OPTIONS') {
        return { statusCode: 200, headers: require('./lib/utils').headers, body: '' };
    }

    const url = new URL(path, 'http://localhost');
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    try {
        if (method === 'GET' && pathname.includes('/rentals')) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded) {
                return sendError(401, '令牌无效');
            }

            let rentals = getData('rentals');
            
            const status = searchParams.get('status');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            if (status && status !== 'all') {
                rentals = rentals.filter(r => r.status === status);
            }

            const total = rentals.length;
            const start = (page - 1) * limit;
            const paginatedRentals = rentals.slice(start, start + limit);

            return sendResponse(200, {
                rentals: paginatedRentals,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (method === 'POST' && pathname.includes('/rentals')) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded) {
                return sendError(401, '令牌无效');
            }

            const body = JSON.parse(rawBody);
            const { mountain, code, duration, cost } = body;

            if (!mountain || !code) {
                return sendError(400, '请填写完整信息');
            }

            const newRental = addItem('rentals', {
                id: Date.now(),
                userId: decoded.id,
                mountain,
                code,
                time: new Date().toLocaleString(),
                duration: duration || '进行中',
                cost: parseFloat(cost) || 0,
                status: 'active'
            });

            return sendResponse(200, { rental: newRental }, '租借成功');
        }

        if (method === 'PUT' && pathname.match(/\/rentals\/\d+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '请先登录');
            }
            
            const decoded = verifyToken(token);
            if (!decoded) {
                return sendError(401, '令牌无效');
            }

            const id = pathname.split('/').pop();
            const body = JSON.parse(rawBody);
            
            const updated = updateItem('rentals', parseInt(id), { ...body, status: 'done' });
            
            if (!updated) {
                return sendError(404, '租借记录不存在');
            }

            return sendResponse(200, { rental: updated }, '归还成功');
        }

        return sendError(404, '未知的租借请求');

    } catch (error) {
        console.error('Rentals API Error:', error);
        return sendError(500, '服务器错误');
    }
};
