const { sendResponse, sendError } = require('./lib/utils');
const { getData, addItem, updateItem, deleteItem, findItem } = require('./lib/db');
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
        if (method === 'GET' && pathname.includes('/products') && !pathname.match(/\/products\/\d+$/)) {
            let products = getData('products');
            
            const category = searchParams.get('category');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            if (category && category !== 'all') {
                products = products.filter(p => p.category === category);
            }

            const total = products.length;
            const start = (page - 1) * limit;
            const paginatedProducts = products.slice(start, start + limit);

            return sendResponse(200, {
                products: paginatedProducts,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (method === 'GET' && pathname.match(/\/products\/\d+$/)) {
            const id = parseInt(pathname.split('/').pop());
            const product = findItem('products', 'id', id);
            
            if (!product) {
                return sendError(404, '商品不存在');
            }

            return sendResponse(200, { product });
        }

        if (method === 'POST' && pathname.includes('/products') && !pathname.match(/\/products\/\d+$/)) {
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
            const { name, category, price, stock, badge, desc } = body;

            if (!name || !price) {
                return sendError(400, '请填写完整信息');
            }

            const newProduct = addItem('products', {
                name,
                category: category || '周边',
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                sales: 0,
                badge: badge || '',
                desc: desc || '',
                status: 'active'
            });

            return sendResponse(200, { product: newProduct }, '添加成功');
        }

        if (method === 'PUT' && pathname.match(/\/products\/\d+$/)) {
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

            const id = pathname.split('/').pop();
            const body = JSON.parse(rawBody);
            
            const updated = updateItem('products', parseInt(id), body);
            
            if (!updated) {
                return sendError(404, '商品不存在');
            }

            return sendResponse(200, { product: updated }, '更新成功');
        }

        if (method === 'DELETE' && pathname.match(/\/products\/\d+$/)) {
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

            const id = pathname.split('/').pop();
            const deleted = deleteItem('products', parseInt(id));
            
            if (!deleted) {
                return sendError(404, '商品不存在');
            }

            return sendResponse(200, {}, '删除成功');
        }

        return sendError(404, '未知的商品请求');

    } catch (error) {
        console.error('Products API Error:', error);
        return sendError(500, '服务器错误');
    }
};
