const { handleOptions, parseBody, sendSuccess, sendError } = require('../lib/utils');
const { getData, addItem, updateItem, deleteItem, findItem } = require('../lib/db');
const { authMiddleware } = require('../lib/auth');

module.exports = async (req, res) => {
    if (handleOptions(req, res)) return;

    const { method } = req;
    const path = req.url.split('?')[0];
    const url = new URL(req.url, `http://${req.headers.host}`);
    const searchParams = url.searchParams;

    try {
        if (method === 'GET' && path === '/api/partners') {
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

            return sendSuccess(res, {
                partners: paginatedPartners,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        if (method === 'GET' && path === '/api/partners/my') {
            const auth = authMiddleware(req);
            if (!auth.valid) {
                return sendError(res, '请先登录', 401);
            }

            const partners = getData('partners').filter(p => p.userId === auth.user.id);
            return sendSuccess(res, { partners });
        }

        if (method === 'GET' && path === '/api/partners/applications') {
            const auth = authMiddleware(req);
            if (!auth.valid) {
                return sendError(res, '请先登录', 401);
            }

            const applications = getData('partnerApplications').filter(a => a.leaderId === auth.user.id);
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
            
            return sendSuccess(res, { applications: applicants });
        }

        if (method === 'POST' && path === '/api/partners') {
            const auth = authMiddleware(req);
            if (!auth.valid) {
                return sendError(res, '请先登录', 401);
            }

            const body = await parseBody(req);
            const { route, date, total, difficulty, description } = body;

            if (!route || !date) {
                return sendError(res, '请填写完整信息');
            }

            const newPartner = addItem('partners', {
                name: auth.user.name,
                userId: auth.user.id,
                route,
                date,
                total: parseInt(total) || 2,
                need: (parseInt(total) || 2) - 1,
                difficulty: difficulty || '中等',
                description: description || '',
                createTime: new Date().toLocaleDateString(),
                status: 'recruiting'
            });

            return sendSuccess(res, { partner: newPartner }, '发布成功');
        }

        if (method === 'POST' && path === '/api/partners/apply') {
            const auth = authMiddleware(req);
            if (!auth.valid) {
                return sendError(res, '请先登录', 401);
            }

            const body = await parseBody(req);
            const { partnerId, message } = body;

            const partner = findItem('partners', 'id', parseInt(partnerId));
            if (!partner) {
                return sendError(res, '招募信息不存在', 404);
            }

            if (partner.need <= 0) {
                return sendError(res, '该队伍已满员');
            }

            const existingApp = getData('partnerApplications').find(
                a => a.partnerId == partnerId && a.applicantId === auth.user.id
            );
            if (existingApp) {
                return sendError(res, '您已申请过，请等待审核');
            }

            const application = addItem('partnerApplications', {
                partnerId: parseInt(partnerId),
                applicantId: auth.user.id,
                applicantName: auth.user.name,
                leaderId: partner.userId,
                message: message || '',
                status: 'pending',
                createTime: new Date().toLocaleString()
            });

            return sendSuccess(res, { application }, '申请已提交，请等待队长审核');
        }

        if (method === 'POST' && path.match(/^\/api\/partners\/applications\/\d+\/approve$/)) {
            const auth = authMiddleware(req);
            if (!auth.valid) {
                return sendError(res, '请先登录', 401);
            }

            const appId = path.split('/')[3];
            const application = findItem('partnerApplications', 'id', parseInt(appId));
            
            if (!application) {
                return sendError(res, '申请不存在', 404);
            }

            if (application.leaderId !== auth.user.id) {
                return sendError(res, '无权限操作', 403);
            }

            const partner = findItem('partners', 'id', application.partnerId);
            if (!partner || partner.need <= 0) {
                return sendError(res, '队伍已满员', 400);
            }

            updateItem('partnerApplications', parseInt(appId), { status: 'approved' });
            updateItem('partners', application.partnerId, { need: partner.need - 1 });

            if (partner.need - 1 <= 0) {
                updateItem('partners', application.partnerId, { status: 'full' });
            }

            return sendSuccess(res, {}, '已同意申请');
        }

        if (method === 'POST' && path.match(/^\/api\/partners\/applications\/\d+\/reject$/)) {
            const auth = authMiddleware(req);
            if (!auth.valid) {
                return sendError(res, '请先登录', 401);
            }

            const appId = path.split('/')[3];
            const application = findItem('partnerApplications', 'id', parseInt(appId));
            
            if (!application) {
                return sendError(res, '申请不存在', 404);
            }

            if (application.leaderId !== auth.user.id) {
                return sendError(res, '无权限操作', 403);
            }

            updateItem('partnerApplications', parseInt(appId), { status: 'rejected' });

            return sendSuccess(res, {}, '已拒绝申请');
        }

        if (method === 'PUT' && path.match(/^\/api\/partners\/\d+$/)) {
            const id = path.split('/').pop();
            const body = await parseBody(req);
            
            const partner = findItem('partners', 'id', parseInt(id));
            if (!partner) {
                return sendError(res, '招募信息不存在', 404);
            }

            const updated = updateItem('partners', parseInt(id), body);

            return sendSuccess(res, { partner: updated }, '更新成功');
        }

        if (method === 'DELETE' && path.match(/^\/api\/partners\/\d+$/)) {
            const auth = authMiddleware(req);
            if (!auth.valid || !auth.user.isAdmin) {
                return sendError(res, '无权限操作', 403);
            }

            const id = path.split('/').pop();
            const deleted = deleteItem('partners', parseInt(id));
            
            if (!deleted) {
                return sendError(res, '招募信息不存在', 404);
            }

            return sendSuccess(res, {}, '删除成功');
        }

        return sendError(res, '未知的搭子请求', 404);

    } catch (error) {
        console.error('Partners API Error:', error);
        return sendError(res, '服务器错误', 500);
    }
};
