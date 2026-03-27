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
        if (method === 'GET' && pathname.includes('/orders')) {
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

            let orders = getData('orders');
            
            const status = searchParams.get('status');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            if (status && status !== 'all') {
                orders = orders.filter(o => o.status === status);
            }

            if (!decoded.isAdmin) {
                orders = orders.filter(o => o.userId === decoded.id);
            }

            const total = orders.length;
            const start = (page - 1) * limit;
            const paginatedOrders = orders.slice(start, start + limit);

            return sendResponse(200, {
                orders: paginatedOrders,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (method === 'POST' && pathname.includes('/orders')) {
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
            const { product, amount } = body;

            if (!product || !amount) {
                return sendError(400, '请填写完整信息');
            }

            const newOrder = addItem('orders', {
                id: 'ORD' + Date.now().toString().slice(-6),
                userId: decoded.id,
                product,
                amount: parseFloat(amount),
                time: new Date().toLocaleString(),
                status: 'pending'
            });

            return sendResponse(200, { order: newOrder }, '下单成功');
        }

        if (method === 'PUT' && pathname.match(/\/orders\/[^/]+$/)) {
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

            const orderId = pathname.split('/').pop();
            const body = JSON.parse(rawBody);
            
            const updated = updateItem('orders', orderId, body);
            
            if (!updated) {
                return sendError(404, '订单不存在');
            }

            return sendResponse(200, { order: updated }, '更新成功');
        }

        return sendError(404, '未知的订单请求');

    } catch (error) {
        console.error('Orders API Error:', error);
        return sendError(500, '服务器错误');
    }
};
