var path = require("path");
var fs = require("fs");
var async = require("async");


function generateBootOptions(app, options, finalCb) {

    // Initialize the boot options
    var loopbackBootOptions = {
        bootDirs: [],
        modelSources: options.modelSources || [],
        mixinSources: options.mixinSources || []
    };

    // Get the root app directory
    var appDir = path.join(__dirname, "..", "..", "server");
    var configsPath = path.join(appDir, "configs");

    // Add default loopback directories
    loopbackBootOptions.appRootDir = path.join(appDir);
    loopbackBootOptions.appConfigRootDir = configsPath;
    loopbackBootOptions.modelsRootDir = configsPath;
    loopbackBootOptions.dsRootDir = configsPath;
    loopbackBootOptions.middleware = require(path.join(appDir, "configs", "middleware"));
    loopbackBootOptions.bootDirs.push(path.join(appDir, "boot"));
    loopbackBootOptions.modelSources.push(path.join(appDir, "..", "common", "models"));

    // MIXIN PATHS ARE ALL RELATIVE TO tempostorm/server
    loopbackBootOptions.mixinSources.push(path.join("mixins"));
    loopbackBootOptions.mixinSources.push(path.join("..", "common", "mixins"));

    // Get module dirs
    async.waterfall([

        // check for modules folder
        function (seriesCb) {
            var modulePath = path.join(appDir, "..", "modules");
            var file = fs.openSync(modulePath, 'r');
            var stats = fs.fstatSync(file);

            if (!stats.isDirectory()) {
                return seriesCb(true);
            }

            return seriesCb(undefined, modulePath);
        },
        // Iterate over modules folder
        function (modulesPath, seriesCb) {
            return crawlModulesDir(modulesPath, seriesCb);
        }
    ],
        function (err) {
            if (err && err !== true) {
                return finalCb(err);
            }

            return finalCb(undefined, loopbackBootOptions);
        });

    function crawlModulesDir(modulesPath, modulesCb) {
        var files = fs.readdirSync(modulesPath);
        return async.eachSeries(files, function (file, eachCb) {
            var newPath = path.join(modulesPath, file);
            var stats = fs.statSync(newPath);

            if (!stats.isDirectory()) {
                return eachCb();
            }

            var mixinPath = path.join("..", "modules", file);
            return crawlModuleDir(newPath, mixinPath, eachCb);
        }, modulesCb);
    }

    function crawlModuleDir(modulePath, mixinPath, moduleCb) {
        var files = fs.readdirSync(modulePath);
        return async.eachSeries(files, function (file, eachCb) {
            var newPath = path.join(modulePath, file);
            var stats = fs.statSync(newPath);
            if (!stats.isDirectory()) {
                return eachCb();
            }

            var newMixinPath = path.join(mixinPath, file);

            // Handlers
            if (file === "server") {
                return serverHandler(newPath, newMixinPath, eachCb);
            } else if (file === "common") {
                return commonHandler(newPath, eachCb);
            }


            return eachCb();
        }, moduleCb);
    }

    function serverHandler(serverPath, mixinPath, serverCb) {
        var files = fs.readdirSync(serverPath);
        return async.eachSeries(files, function (file, eachCb) {
            var newPath = path.join(serverPath, file);
            var stats = fs.statSync(newPath);
            if (!stats.isDirectory()) {
                return eachCb();
            }

            // Handlers
            if (file === "boot") {
                bootHandler(newPath);
            } else if (file === "mixins") {
                var newMixinPath = path.join(mixinPath, file);
                return mixinsHandler(newPath, newMixinPath, eachCb);
            }

            return eachCb();
        }, serverCb);
    }

    function bootHandler(bootPath) {
        loopbackBootOptions.bootDirs.push(bootPath);
    }

    function mixinsHandler(bootPath, mixinPath, finalCb) {
        var files = fs.readdirSync(bootPath);
        return async.eachSeries(files, function (file, eachCb) {
            var newPath = path.join(bootPath, file);
            var stats = fs.statSync(newPath);
            if (!stats.isDirectory()) {
                return eachCb();
            }

            var newMixinPath = path.join(mixinPath, file);
            loopbackBootOptions.mixinSources.push(newMixinPath);

            return eachCb();
        }, finalCb);
    }


    function commonHandler(commonPath, commonCb) {
        var files = fs.readdirSync(commonPath);
        return async.eachSeries(files, function (file, eachCb) {
            var newPath = path.join(commonPath, file);
            var stats = fs.statSync(newPath);
            if (!stats.isDirectory()) {
                return eachCb();
            }

            // Handlers
            if (file === "models") {
                return modelHandler(newPath, eachCb);
            }

            return eachCb();
        }, commonCb);
    }

    function modelHandler(modelSourcePath, finalCb) {
        loopbackBootOptions.modelSources.push(modelSourcePath);
        return finalCb();
    }
}

module.exports = {
    generateBootOptions: generateBootOptions
};