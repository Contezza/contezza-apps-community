const { getIdentityProxy, getEcmProxy, host } = require('../../proxy-helpers');

module.exports = {
    ...getIdentityProxy(host.ALFRESCO_URL),
    ...getEcmProxy(host.ALFRESCO_URL),
};
