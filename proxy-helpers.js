/* eslint-env es6 */

module.exports = {
    host: {
        LOCALHOST_ECM: 'http://127.0.0.1:8080',
        LOCALHOST_BPM: 'http://127.0.0.1:9080',
    },

    // PROXIES:
    getIdentityProxy: function (host) {
        console.log('Target for /auth', host);
        return {
            '/auth': {
                target: host,
                secure: false,
                changeOrigin: true,
            },
        };
    },
    getEcmProxy: function (host) {
        console.log('Target for /alfresco', host);
        return {
            '/alfresco': {
                target: host,
                secure: false,
                pathRewrite: {
                    '^/alfresco/alfresco': '',
                },
                changeOrigin: true,
                onProxyReq: function (request) {
                    if (request['method'] !== 'GET') request.setHeader('origin', host);
                },
                // workaround for REPO-2260
                onProxyRes: function (proxyRes, req, res) {
                    const header = proxyRes.headers['www-authenticate'];
                    if (header && header.startsWith('Basic')) {
                        proxyRes.headers['www-authenticate'] = 'x' + header;
                    }
                },
            },
        };
    },
    getBpmProxy: function (host) {
        console.log('Target for /activiti-app', host);
        return {
            '/activiti-app': {
                target: host,
                secure: false,
                changeOrigin: true,
            },
        };
    },
};
