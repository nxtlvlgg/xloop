
var ID_SUFFIX = "Id";


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function convertMillisecondsToDigitalClock(ms) {
    hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
        minutes = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
        seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
    return {
        hours : hours,
        minutes : minutes,
        seconds : seconds,
        clock : hours + ":" + minutes + ":" + seconds
    };
}


function modelNameFromForeignKey(key) {
    if(!isForeignKey(key)) {
        throw new Error("No model for key:", key);
    }

    var modelName = key.slice(0, key.length-2);

    // Amend known exceptions
    if(modelName === "author" || modelName === "owner") {
        modelName = "user";
    }

    if(!app.models[modelName]) {
        throw new Error("No model for key:", key);
    }
    return modelName;
}

function getFirstForeignKey(data) {
    if(typeof data !== "object") {
        return;
    }

    for(var key in data) {
        if(!data[key])
            continue;

        var suffix = key.slice(key.length-3, key.length-1);
        if(suffix === "Id") {
            return key;
        }
    }
}


function getModelFromRemoteMethod(parentModel, methodName) {

    var methodArr = methodName.split("__");
    if (methodArr.length < 2) {
        return parentModel;
    }

    var relationName = methodArr[methodArr.length - 1];
    var relationConfig = parentModel.settings.relations[relationName]
        || parentModel.relations[relationName];
    var modelName = relationConfig.model;

    return parentModel.app.models[modelName];
}


function getOptionForModelRelation(Model, relationName, optionName) {
    if(Model.relations[relationName].options[optionName] !== undefined
        && Model.relations[relationName].options[optionName] !== null) {
        return Model.relations[relationName].options[optionName]
    }

    if(!Model.settings.relations[relationName]) {
        return;
    }

    return Model.settings.relations[relationName][optionName];
}



module.exports = {
    getRandomInt : getRandomInt,
    convertMillisecondsToDigitalClock : convertMillisecondsToDigitalClock,
    modelNameFromForeignKey: modelNameFromForeignKey,
    getModelFromRemoteMethod: getModelFromRemoteMethod,
    getOptionForModelRelation: getOptionForModelRelation
};
