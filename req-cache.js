var loopback = require("loopback");
var LoopBackContext = require('loopback-context');

function setRequest(ctx) {
    var currentContext = LoopBackContext.getCurrentContext();
    currentContext.set('req', ctx.req);
}

function getRequest() {
    var req;
    if (LoopBackContext) {
        req = LoopBackContext.get("req");
    }

    return req || {};
}


module.exports = {
    setRequest: setRequest,
    getRequest: getRequest
};