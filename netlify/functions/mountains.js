const { sendResponse, sendError, parseQueryString } = require('./lib/utils');
const { getData, findItem, addItem, updateItem, deleteItem } = require('./lib/db');
const { verifyToken, extractToken } = require('./lib/auth');

exports.handler = async (event, context) => {
    const { httpMethod: method, path, body: rawBody, headers: eventHeaders } = event;

    if (method === 'OPTIONS') {
        return { statusCode: 200, headers: require('./lib/utils').headers, body: '' };
    }

    const { pathname, searchParams } = parseQueryString(path);

    try {
        if (method === 'GET' && pathname.includes('/mountains')) {
            let mountains = getData('mountains');
            
            const keyword = searchParams.get('keyword');
            const difficulty = searchParams.get('difficulty');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            if (keyword) {
                mountains = mountains.filter(m => 
                    m.name.includes(keyword) || m.location.includes(keyword)
                );
            }

            if (difficulty) {
                mountains = mountains.filter(m => m.difficulty === difficulty);
            }

            const total = mountains.length;
            const start = (page - 1) * limit;
            const paginatedMountains = mountains.slice(start, start + limit);

            return sendResponse(200, {
                mountains: paginatedMountains,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

        if (method === 'GET' && pathname.match(/\/mountains\/\d+$/)) {
            const id = parseInt(pathname.split('/').pop());
            const mountain = findItem('mountains', 'id', id);
            
            if (!mountain) {
                return sendError(404, '山峰不存在');
            }

            mountain.views = (mountain.views || 0) + 1;
            updateItem('mountains', id.toString(), { views: mountain.views });

            return sendResponse(200, { mountain });
        }

        if (method === 'POST' && pathname.includes('/mountains')) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '未提供认证令牌');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            const body = JSON.parse(rawBody);
            const { name, location, altitude, difficulty, rating, description, image, badges } = body;

            if (!name || !location || !altitude) {
                return sendError(400, '请填写完整信息');
            }

            const newMountain = addItem('mountains', {
                name,
                location,
                altitude: parseInt(altitude),
                difficulty: difficulty || '中等',
                rating: parseFloat(rating) || 4.5,
                description: description || '',
                image: image || '',
                badges: badges || [],
                views: 0,
                isNew: true
            });

            return sendResponse(200, { mountain: newMountain }, '添加成功');
        }

        if (method === 'PUT' && pathname.match(/\/mountains\/\d+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '未提供认证令牌');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            const id = pathname.split('/').pop();
            const body = JSON.parse(rawBody);
            
            const updated = updateItem('mountains', parseInt(id), body);
            
            if (!updated) {
                return sendError(404, '山峰不存在');
            }

            return sendResponse(200, { mountain: updated }, '更新成功');
        }

        if (method === 'DELETE' && pathname.match(/\/mountains\/\d+$/)) {
            const authHeader = eventHeaders?.authorization || eventHeaders?.Authorization;
            let token = null;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
            
            if (!token) {
                return sendError(401, '未提供认证令牌');
            }
            
            const decoded = verifyToken(token);
            if (!decoded || !decoded.isAdmin) {
                return sendError(403, '无权限操作');
            }

            const id = pathname.split('/').pop();
            const deleted = deleteItem('mountains', parseInt(id));
            
            if (!deleted) {
                return sendError(404, '山峰不存在');
            }

            return sendResponse(200, {}, '删除成功');
        }

        return sendError(404, '未知的山峰请求');

    } catch (error) {
        console.error('Mountains API Error:', error);
        return sendError(500, '服务器错误');
    }
};
