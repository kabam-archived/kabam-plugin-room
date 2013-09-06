exports = module.exports = function (kabam) {

  kabam.app.get('/h', function(request,response){
    request.model.groups.find({tier:1},function(err,schoolsFound){
      response.render('groups/hierarchy',{
        'title':'Schools',
        'doIndex':true,
        'schools':schoolsFound
      });
    });
  });


  //get group homepage
  kabam.app.get(/\/h\/([a-z0-9_]+)\/?([a-z0-9_]*)\/?([a-z0-9_]*)\/?$/, function (request, response) {
    //tier 1 - school
    request.model.groups.findGroup(request.params[0], request.params[1], request.params[2], function (err, groupFound) {
      if (err) {
        throw err;
      }
      if(groupFound){
        groupFound.export(request.user, function(err,groupPrepared){
          if(request.is('json')){
            response.json(groupPrepared);
          } else {
            console.log(groupPrepared);
            response.render('groups/group', {
              'title':groupPrepared.name,
              'doIndex':true,
              'group':groupPrepared
            });
          }
        });
      } else {
        response.send(404);
      }
    });
  });

  //get group blog
  kabam.app.get(/\/h\/([a-z0-9_]+)\/?([a-z0-9_]*)\/?([a-z0-9_]*)\/blog$/, function (request, response) {
    request.model.groups.findGroup(
        request.params[0],
        request.params[1],
        request.params[2],
        function (err, groupFound) {
          if (err) {
            throw err;
          }
        if(groupFound){
          groupFound.getBlog(request.user,function(err,blogFound){
            console.log(request.params);
            response.json(blogFound);//todo - create template later
          });
        } else {
          response.send(404);
        }
        });
  });

  //get group members
  kabam.app.get(/\/h\/([a-z0-9_]+)\/members$/, function (request, response) {
    response.send('tier1 group blog ' + request.params[0]);
  });

};
