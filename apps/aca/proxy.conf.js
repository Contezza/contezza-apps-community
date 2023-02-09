const { getIdentityProxy, getEcmProxy, host } = require('../../proxy-helpers');

module.exports = {
    ...getIdentityProxy(host.LOCALHOST_ECM),
    ...getEcmProxy(host.LOCALHOST_ECM),
};
