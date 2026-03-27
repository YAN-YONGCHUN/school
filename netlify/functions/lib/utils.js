const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
};

function sendResponse(status, data) {
    return {
        statusCode: status,
        headers,
        body: JSON.stringify({ success: true, message: data.message || '操作成功', data: data.data || data })
    };
}

function sendError(status, message = '操作失败') {
    return {
        statusCode: status,
        headers,
        body: JSON.stringify({ success: false, message })
    };
}

function parseQueryString(path) {
    const url = new URL(path, 'http://localhost');
    return {
        pathname: url.pathname,
        searchParams: url.searchParams
    };
}

module.exports = {
    headers,
    sendResponse,
    sendError,
    parseQueryString
};
