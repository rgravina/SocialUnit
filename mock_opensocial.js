var SimpleContainer = function(baseUrl, domain, supportedFieldsArray) {
  opensocial.Container.call(this);

  var supportedFieldsMap = {};
  for (var objectType in supportedFieldsArray) {
    if (supportedFieldsArray.hasOwnProperty(objectType)) {
      supportedFieldsMap[objectType] = {};
      for (var i = 0; i < supportedFieldsArray[objectType].length; i++) {
        var supportedField = supportedFieldsArray[objectType][i];
        supportedFieldsMap[objectType][supportedField] = true;
      }
    }
  }

  this.environment_ = new opensocial.Environment(domain, supportedFieldsMap);
  this.baseUrl_ = baseUrl;
};

SimpleContainer.inherits(opensocial.Container);

SimpleContainer.prototype.makeIdSpec = function(id) {
  return new opensocial.IdSpec({'userId' : id});
};


SimpleContainer.prototype.translateIdSpec = function(newIdSpec) {
  var userIds = newIdSpec.getField('userId');
  var groupId = newIdSpec.getField('groupId');

  // Upconvert to array for convenience
  if (!opensocial.Container.isArray(userIds)) {
    userIds = [userIds];
  }

  for (var i = 0; i < userIds.length; i++) {
    if (userIds[i] == 'OWNER') {
      userIds[i] = '@owner';
    } else if (userIds[i] == 'VIEWER') {
      userIds[i] = '@viewer';
    }
  }

  if (groupId == 'FRIENDS') {
    groupId = "@friends";
  } else if (groupId == 'SELF' || !groupId) {
    groupId = "@self";
  }

  return { userId : userIds, groupId : groupId};
};


SimpleContainer.prototype.newFetchPeopleRequest = function(idSpec,
    opt_params) {
  var rpc = { method : "people.get" };
  rpc.params = this.translateIdSpec(idSpec);
  if (opt_params['profileDetail']) {
    FieldTranslations.translateJsPersonFieldsToServerFields(opt_params['profileDetail']);
    rpc.params.fields = opt_params['profileDetail'];
  }
  if (opt_params['first']) {
    rpc.params.startIndex = opt_params['first'];
  }
  if (opt_params['max']) {
    rpc.params.count = opt_params['max'];
  }
  if (opt_params['sortOrder']) {
    rpc.params.sortBy = opt_params['sortOrder'];
  }
  if (opt_params['filter']) {
    rpc.params.filterBy = opt_params['filter'];
  }
  if (idSpec.getField('networkDistance')) {
    rpc.params.networkDistance = idSpec.getField('networkDistance');
  }

  var me = this;
  return new SimpleRequestItem(rpc,
      function(rawJson) {
        var jsonPeople;
        if (rawJson['list']) {
          // For the array of people response
          jsonPeople = rawJson['list'];
        } else {
          // For the single person response
          jsonPeople = [rawJson];
        }

        var people = [];
        for (var i = 0; i < jsonPeople.length; i++) {
          people.push(me.createPersonFromJson(jsonPeople[i]));
        }
        return new opensocial.Collection(people,
            rawJson['startIndex'], rawJson['totalResults']);
      });
};


SimpleContainer.prototype.newFetchPersonRequest = function(id, opt_params) {
  var peopleRequest = this.newFetchPeopleRequest(
      this.makeIdSpec(id), opt_params);

  var me = this;
  return new SimpleRequestItem(peopleRequest.rpc,
          function(rawJson) {
            return me.createPersonFromJson(rawJson);
          });
};


SimpleContainer.prototype.createPersonFromJson = function(serverJson) {
  FieldTranslations.translateServerPersonToJsPerson(serverJson);
  return new JsonPerson(serverJson);
};


var SimpleRequestItem = function(rpc, opt_processData) {
  this.rpc = rpc;
  this.processData = opt_processData ||
                     function (rawJson) {
                       return rawJson;
                     };

  this.processResponse = function(originalDataRequest, rawJson, error,
      errorMessage) {
    var errorCode = error
      ? JsonRpcContainer.translateHttpError("Error " + error['code'])
      : null;
    return new opensocial.ResponseItem(originalDataRequest,
        error ? null : this.processData(rawJson), errorCode, errorMessage);
  }
};



var result = [{"data":{"addresses":[{"postalCode":"12345","longitude":143.0859,"country":"US","locality":"who knows","formatted":"PoBox 3565, 1 OpenStandards Way, Apache CA","type":"home","objectId":4,"region":"Apache, CA","streetAddress":"1 OpenStandards Way","latitude":28.3043}],"sexualOrientation":"north","happiestWhen":"coding","ethnicity":"developer","books":["The Cathedral & the Bazaar","Catch 22"],"profileVideo":{"value":"http://www.example.org/videos/Thriller.flv","type":"video","objectId":2,"linkText":"Thriller"},"profileUrl":"http://www.example.org/?id=1","id":"canonical","turnOffs":["lack of unit tests","cabbage"],"scaredOf":"COBOL","humor":"none to speak of","bodyType":{"eyeColor":"blue","height":1.84,"build":"svelte","objectId":1,"hairColor":"black","weight":74},"lookingFor":[{"value":"RANDOM","objectId":1,"displayValue":"Random"},{"value":"NETWORKING","objectId":2,"displayValue":"Networking"}],"turnOns":["well document code"],"music":["Chieftains","Beck"],"urls":[{"value":"http://www.example.org/?id=1","type":"profile","objectId":3,"linkText":"my profile"},{"value":"http://www.example.org/pic/?id=1","type":"thumbnail","objectId":4,"linkText":"my awesome picture"}],"tags":["C#","JSON","template"],"heroes":["Doug Crockford","Charles Babbage"],"gender":"male","nickname":"diggy","drinker":{"value":"SOCIALLY","objectId":1,"displayValue":"Socially"},"organizations":[{"subField":"Development","startDate":"1995-01-01","title":"Grand PooBah","type":"job","objectId":1,"description":"lots of coding","address":{"formatted":"1 Shindig Drive","objectId":2},"field":"Software Engineering","endDate":"2010-10-10","webpage":"http://incubator.apache.org/projects/shindig.html","name":"Apache.com","salary":"$1000000000"},{"subField":"Lab Tech","startDate":"1991-01-01","title":"Gopher","type":"job","objectId":2,"description":"","address":{"formatted":"1 Skid Row","objectId":3},"field":"College","endDate":"1995-01-01","webpage":"","name":"School of hard knocks","salary":"$100"}],"religion":"druidic","pets":"dog,cat","interests":["PHP","Java"],"isOwner":true,"relationshipStatus":"married to my job","movies":["Iron Man","Nosferatu"],"networkPresence":{"value":"ONLINE","objectId":1,"displayValue":"Online"},"currentLocation":{"longitude":2.29419,"objectId":1,"latitude":48.858192},"displayName":"Shin Digg","accounts":[],"photos":[{"value":"http://www.example.org/pic/?id=1","type":"thumbnail","objectId":1}],"smoker":{"value":"NO","objectId":1,"displayValue":"No"},"romance":"twice a year","utcOffset":-8,"objectId":1,"ims":[],"food":["sushi","burgers"],"profileSong":{"value":"http://www.example.org/songs/OnlyTheLonely.mp3","type":"road","objectId":1,"linkText":"Feelin' blue"},"updated":"2006-06-06 12:12:12.0","age":33,"sports":["frisbee","rugby"],"cars":["beetle","prius"],"phoneNumbers":[{"value":"111-111-111","type":"work","objectId":1},{"value":"999-999-999","type":"mobile","objectId":2}],"activities":["Coding Shindig"],"aboutMe":"I have an example of every piece of data","politicalViews":"open leaning","name":{"honorificPrefix":"Sir","honorificSuffix":"Social Butterfly","unstructured":"Sir Shin H. Digg Social Butterfly","objectId":1,"additionalName":"H","givenName":"Shin","familyName":"Digg"},"tvShows":["House","Battlestart Galactica"],"fashion":"t-shirts","birthday":"1975-01-01","thumbnailUrl":"http://www.example.org/pic/?id=1","emails":[{"value":"shindig-dev@incubator.apache.org","type":"work","objectId":1}],"livingArrangement":"in a house","status":"happy","jobInterests":"will work for beer","isViewer":true,"languagesSpoken":["English","Dutch","Esperanto"],"quotes":["I am therfore I code","Doh!"],"children":"3"},"id":"viewer"},{"data":{"list":[{"addresses":[],"accounts":[],"photos":[],"objectId":4,"books":[],"ims":[],"food":[],"id":"george.doe","turnOffs":[],"sports":[],"cars":[],"phoneNumbers":[],"lookingFor":[],"turnOns":[],"activities":[],"music":[],"urls":[],"tags":[],"heroes":[],"tvShows":[],"gender":"male","organizations":[],"emails":[],"interests":[],"isOwner":false,"isViewer":false,"movies":[],"languagesSpoken":[],"quotes":[],"displayName":"Georgey"},{"addresses":[],"accounts":[],"photos":[],"objectId":3,"books":[],"ims":[],"food":[],"id":"jane.doe","turnOffs":[],"sports":[],"cars":[],"phoneNumbers":[],"lookingFor":[],"turnOns":[],"activities":[],"music":[],"urls":[],"tags":[],"heroes":[],"tvShows":[],"gender":"female","organizations":[],"emails":[],"interests":[],"isOwner":false,"isViewer":false,"movies":[],"languagesSpoken":[],"quotes":[],"displayName":"Janey"},{"addresses":[],"accounts":[],"photos":[],"objectId":2,"books":[],"ims":[],"food":[],"id":"john.doe","turnOffs":[],"sports":[],"cars":[],"phoneNumbers":[],"lookingFor":[],"turnOns":[],"activities":[],"music":[],"urls":[],"tags":[],"heroes":[],"tvShows":[],"gender":"male","organizations":[],"emails":[],"interests":[],"isOwner":false,"isViewer":false,"movies":[],"languagesSpoken":[],"quotes":[],"displayName":"Johnny"}],"totalResults":3,"startIndex":0},"id":"friends"}];

SimpleContainer.prototype.requestData = function(dataRequest, callback) {
  callback = callback || function(){};
  var requestObjects = dataRequest.getRequestObjects();
  var totalRequests = requestObjects.length;

  if (totalRequests == 0) {
    window.setTimeout(function() {
      callback(new opensocial.DataResponse({}, true));
    }, 0);
    return;
  }

  var jsonBatchData = new Array(totalRequests);

  for (var j = 0; j < totalRequests; j++) {
    var requestObject = requestObjects[j];

    //jsonBatchData[j] = requestObject.request.rpc;
    //if (requestObject.key) {
    //  jsonBatchData[j].id = requestObject.key;
    //}
  }

  var sendResponse = function(result) {
    var globalError = false;
    var responseMap = {};

    // Map from indices to ids.
    for (var i = 0; i < result.length; i++) {
      result[result[i].id] = result[i];
    }

    for (var k = 0; k < requestObjects.length; k++) {
      var request = requestObjects[k];
      var response = result[k];
      if (request.key && response.id != request.key) {
        throw "Request key(" + request.key +
            ") and response id(" + response.id + ") do not match";
      }

      var rawData = response.data;
      var error = response.error;
      var errorMessage = "";

      if (error) {
        errorMessage = error.message;
      }
      var processedData = request.request.processResponse(
          request.request, rawData, error, errorMessage);
      globalError = globalError || processedData.hadError();
      if (request.key) {
        responseMap[request.key] = processedData;
      }
       
      
    }

    var dataResponse = new opensocial.DataResponse(responseMap, globalError);
    callback(dataResponse);
  };
  sendResponse(result);

}




