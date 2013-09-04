exports = module.exports = function (kabam) {
  //get group homepage
  kabam.app.get(/\/h\/([a-z0-9_]+)\/?$/, function (request, response) {
    console.log(request.params[0]);
    //tier 1 - school
    request.model.groups.findGroup(request.params[0], function (err, groupFound) {
      if (err) {
        throw err;
      }
      response.json(groupFound);//todo - create template later
    });
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/?$/, function (request, response) {
    //tier 2 - course
    request.model.groups.findGroup(request.params[0], request.params[1], function (err, groupFound) {
      if (err) {
        throw err;
      }
      response.json(groupFound);//todo - create template later
    });
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/?$/, function (request, response) {
    //tier 3 - group
    request.model.groups.findGroup(request.params[0], request.params[1], request.params[2], function (err, groupFound) {
      if (err) {
        throw err;
      }
      response.json(groupFound);//todo - create template later
    });
  });

  //get group blog
  kabam.app.get(/\/h\/([a-z0-9_]+)\/blog$/, function (request, response) {
    request.model.groups.findGroup(request.params[0],  function (err, groupFound) {
      if (err) {
        throw err;
      }
      groupFound.getBlog(request.user,function(err,blogFound){
        response.json(blogFound);//todo - create template later
      });
    });

  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/blog$/, function (request, response) {
    request.model.groups.findGroup(request.params[0], request.params[1], function (err, groupFound) {
      if (err) {
        throw err;
      }
      groupFound.getBlog(request.user,function(err,blogFound){
        response.json(blogFound);//todo - create template later
      });
    });

  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/blog$/, function (request, response) {
    request.model.groups.findGroup(request.params[0], request.params[1], request.params[2], function (err, groupFound) {
      if (err) {
        throw err;
      }
      groupFound.getBlog(request.user,function(err,blogFound){
        response.json(blogFound);//todo - create template later
      });
    });
  });

  //get group members
  kabam.app.get(/\/h\/([a-z0-9_]+)\/members$/, function (request, response) {
    response.send('tier1 group blog ' + request.params[0]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/members$/, function (request, response) {
    response.send('tier2 group blog ' + request.params[0] + ' ' + request.params[1]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/members$/, function (request, response) {
    response.send('tier3 group blog ' + request.params[0] + ' ' + request.params[1] + ' ' + request.params[2]);
  });

  //update group parameters (homepage text)
  kabam.app.put(/\/h\/([a-z0-9_]+)$/, function (request, response) {
    response.send('tier1 group blog ' + request.params[0]);
  });

  kabam.app.put(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)$/, function (request, response) {
    response.send('tier2 group blog ' + request.params[0] + ' ' + request.params[1]);
  });

  kabam.app.put(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)$/, function (request, response) {
    response.send('tier3 group blog ' + request.params[0] + ' ' + request.params[1] + ' ' + request.params[2]);
  });

  //make plog post
  kabam.app.post(/\/h\/([a-z0-9_]+)\/blog$/, function (request, response) {
    response.send('tier1 group blog ' + request.params[0]);
  });

  kabam.app.post(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/blog$/, function (request, response) {
    response.send('tier2 group blog ' + request.params[0] + ' ' + request.params[1]);
  });

  kabam.app.post(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/blog$/, function (request, response) {
    response.send('tier3 group blog ' + request.params[0] + ' ' + request.params[1] + ' ' + request.params[2]);
  });

};