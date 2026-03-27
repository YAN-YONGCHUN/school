const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'memsavor-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function extractToken(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

function authMiddleware(req) {
    const token = extractToken(req);
    if (!token) {
        return { valid: false, error: '未提供认证令牌' };
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        return { valid: false, error: '令牌无效或已过期' };
    }
    
    return { valid: true, user: decoded };
}

module.exports = {
    generateToken,
    verifyToken,
    extractToken,
    authMiddleware,
    JWT_SECRET
};
