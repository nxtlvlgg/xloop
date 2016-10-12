var loopback = require("loopback");
var LoopBackContext = require('loopback-context');

function setRequest(ctx) {
    var currentContext = LoopBackContext.getCurrentContext();
    currentContext.set('req', ctx.req);
}

function getRequest() {
    var currentContext = LoopBackContext.getCurrentContext();
    var req;
    if (currentContext) {
        req = currentContext.get("req");
    }

    return req || {};
}


module.exports = {
    setRequest: setRequest,
    getRequest: getRequest
};