var sanitaze= require('validator').sanitize;

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



  //get group blog
  kabam.app.get(/\/h\/([a-z0-9_]+)\/?([a-z0-9_]*)\/?([a-z0-9_]*)\/blog$/, function (request, response) {
    console.log(request.params);

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
            response.json(blogFound);//todo - create template later
          });
        } else {
          response.send(404);
        }
        });
  });

  //get group members
  kabam.app.get(/\/h\/([a-z0-9_]+)\/?([a-z0-9_]*)\/?([a-z0-9_]*)\/members$/, function (request, response) {
    response.send('tier1 group blog ' + request.params[0]);
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


  //API for groups

  //create group for this user
  kabam.app.post('/api/groups',function(request,response){});

  //update group
  kabam.app.put('/api/groups/:id',function(request,response){});

  //send comment
  kabam.app.post('/api/groups/createMessage/:id',function(request,response){
    request.model.groups.findOne({'_id':request.params.id},function(err,groupFound){
      if(err) throw err;
      if(groupFound){
        groupFound.checkRights(request.user,function(err1,role){
          if(err1) throw err1;
          if(role === 'admin' || role === 'member'){
            request.model.groupMessages.create({
                'groupId': groupFound._id,
                'userId': request.user._id,
                'message': sanitaze(request.body.message).xss(true),
                'user': {
                'username': request.user.username,
                  'firstName': request.user.firstName,
                  'lastName': request.user.lastName,
                  'gravatar': request.user.gravatar
              }
            },function(err2,messageCreated){
              if(err2) throw err2;
              if(messageCreated){
                if(request.is('json')){
                  response.send(201);
                } else {
                  request.flash('success','You have created message in this group!');
                  response.redirect('back');
                }
              } else {
                if(request.is('json')){
                  response.json(403,{'error':'Unable to post message.'});
                } else {
                  request.flash('error','Unable to post message.');
                  response.redirect('back');
                }
              }
            });
          } else {
            if(request.is('json')){
              response.json(403,{'error':'Unable to post message. You are not a member of this group!'});
            } else {
              request.flash('error','Unable to post message. You are not a member of this group!');
              response.redirect('back');
            }
          }
        });
      } else {
        response.send(404);
      }
    });
  });

  //join group
  kabam.app.post('/api/groups/join/:id',function(request,response){});
  //leave group
  kabam.app.post('/api/leave/join/:id',function(request,response){});

  kabam.app.post('/api/groups/invite/:id',function(request,response){});
  kabam.app.post('/api/groups/ban/:id',function(request,response){});

};
