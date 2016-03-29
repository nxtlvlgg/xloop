var loopback = require("loopback");


function setRequest(ctx) {
    loopback.getCurrentContext().set('req', ctx.req);
}

function getRequest() {
    var loopbackContext = loopback.getCurrentContext();
    var req;
    if (loopbackContext) {
        req = loopbackContext.get("req");
    }

    return req || {};
}


module.exports = {
    setRequest: setRequest,
    getRequest: getRequest
};