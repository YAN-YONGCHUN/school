const { sendResponse, sendError } = require('./lib/utils');
const { getData, addItem, updateItem, deleteItem, findItem } = require('./lib/db');
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
        if (method === 'GET' && pathname.includes('/partners') && !pathname.includes('/applications') && !pathname.includes('/my')) {
            let partners = getData('partners');
            
            const status = searchParams.get('status');
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 10;

            if (status && status !== 'all') {
                partners = partners.filter(p => p.status === status);
            }

            const total = partners.length;
            const start = (page - 1) * limit;
            const paginatedPartners = partners.slice(start, start + limit);

            return sendResponse(200, {
                partners: paginatedPartners,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (method === 'GET' && pathname.includes('/partners/my')) {
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

            const partners = getData('partners').filter(p => p.userId === decoded.id);
            return sendResponse(200, { partners });
        }

        if (method === 'GET' && pathname.includes('/partners/applications')) {
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

            const applications = getData('partnerApplications').filter(a => a.leaderId === decoded.id);
            const applicants = [];
            
            for (const app of applications) {
                const user = findItem('users', 'id', app.applicantId);
                const partner = findItem('partners', 'id', app.partnerId);
                if (user && partner) {
                    applicants.push({
                        ...app,
                        applicantName: user.name,
                        applicantPhone: user.phone,
                        partnerRoute: partner.route
                    });
                }
            }
            
            return sendResponse(200, { applications: applicants });
        }

        if (method === 'POST' && pathname.includes('/partners') && !pathname.includes('/apply') && !pathname.includes('/applications')) {
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
            const { route, date, total, difficulty, description } = body;

            if (!route || !date) {
                return sendError(400, '请填写完整信息');
            }

            const newPartner = addItem('partners', {
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
            });

            return sendResponse(200, { partner: newPartner }, '发布成功');
        }

        if (method === 'POST' && pathname.includes('/partners/apply')) {
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
            const { partnerId, message } = body;

            const partner = findItem('partners', 'id', parseInt(partnerId));
            if (!partner) {
                return sendError(404, '招募信息不存在');
            }

            if (partner.need <= 0) {
                return sendError(400, '该队伍已满员');
            }

            const existingApp = getData('partnerApplications').find(
                a => a.partnerId == partnerId && a.applicantId === decoded.id
            );
            if (existingApp) {
                return sendError(400, '您已申请过，请等待审核');
            }

            const application = addItem('partnerApplications', {
                partnerId: parseInt(partnerId),
                applicantId: decoded.id,
                applicantName: decoded.name,
                leaderId: partner.userId,
                message: message || '',
                status: 'pending',
                createTime: new Date().toLocaleString()
            });

            return sendResponse(200, { application }, '申请已提交，请等待队长审核');
        }

        if (method === 'POST' && pathname.match(/\/partners\/applications\/\d+\/approve/)) {
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

            const appId = pathname.split('/')[3];
            const application = findItem('partnerApplications', 'id', parseInt(appId));
            
            if (!application) {
                return sendError(404, '申请不存在');
            }

            if (application.leaderId !== decoded.id) {
                return sendError(403, '无权限操作');
            }

            const partner = findItem('partners', 'id', application.partnerId);
            if (!partner || partner.need <= 0) {
                return sendError(400, '队伍已满员');
            }

            updateItem('partnerApplications', parseInt(appId), { status: 'approved' });
            updateItem('partners', application.partnerId, { need: partner.need - 1 });

            if (partner.need - 1 <= 0) {
                updateItem('partners', application.partnerId, { status: 'full' });
            }

            return sendResponse(200, {}, '已同意申请');
        }

        if (method === 'POST' && pathname.match(/\/partners\/applications\/\d+\/reject/)) {
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

            const appId = pathname.split('/')[3];
            const application = findItem('partnerApplications', 'id', parseInt(appId));
            
            if (!application) {
                return sendError(404, '申请不存在');
            }

            if (application.leaderId !== decoded.id) {
                return sendError(403, '无权限操作');
            }

            updateItem('partnerApplications', parseInt(appId), { status: 'rejected' });

            return sendResponse(200, {}, '已拒绝申请');
        }

        if (method === 'PUT' && pathname.match(/\/partners\/\d+$/)) {
            const id = pathname.split('/').pop();
            const body = JSON.parse(rawBody);
            
            const partner = findItem('partners', 'id', parseInt(id));
            if (!partner) {
                return sendError(404, '招募信息不存在');
            }

            const updated = updateItem('partners', parseInt(id), body);

            return sendResponse(200, { partner: updated }, '更新成功');
        }

        if (method === 'DELETE' && pathname.match(/\/partners\/\d+$/)) {
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
            const deleted = deleteItem('partners', parseInt(id));
            
            if (!deleted) {
                return sendError(404, '招募信息不存在');
            }

            return sendResponse(200, {}, '删除成功');
        }

        return sendError(404, '未知的搭子请求');

    } catch (error) {
        console.error('Partners API Error:', error);
        return sendError(500, '服务器错误');
    }
};
