var sanitaze = require('validator').sanitize,
  async = require('async');

exports = module.exports = function (kabam) {

  kabam.app.get('/h', function (request, response) {
    request.model.groups.find({tier: 1}, function (err, schoolsFound) {
      response.render('groups/hierarchy', {
        'title': 'Schools',
        'doIndex': true,
        'schools': schoolsFound
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
        if (groupFound) {
          groupFound.getBlog(request.user, function (err, blogFound) {
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
        if (request.is('json')) {
          response.json(400, {'error': err.message});
        } else {
          request.flash('error', err.message);
          response.redirect('back');
        }
      }
      if (groupFound) {
        groupFound.export(request.user, function (err, groupPrepared) {
          if (request.is('json')) {
            response.json(groupPrepared);
          } else {
            console.log(groupPrepared);
            response.render('groups/group', {
              'title': groupPrepared.name,
              'doIndex': true,
              'group': groupPrepared
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
  kabam.app.post('/api/groups', function (request, response) {
  });

  //update group
  kabam.app.put('/api/groups/:id', function (request, response) {
    if (request.user) {
      request.model.groups.findOne({'_id': request.params.id}, function (err, groupFound) {
        console.log(groupFound);
        if (err) {
          if (request.is('json')) {
            response.json(400, {'error': err.message});
          } else {
            request.flash('error', err.message);
            response.redirect('back');
          }
        }
        if (groupFound) {
          groupFound.checkRights(request.user, function (err2, role) {
            if (err2) {
              if (request.is('json')) {
                response.json(400, {'error': err2.message});
              } else {
                request.flash('error', err2.message);
                response.redirect('back');
              }
            }
            if (role === 'admin') {
              groupFound.descriptionPublic = sanitaze(request.body.descriptionPublic).xss(true);
              groupFound.descriptionForMembers = sanitaze(request.body.descriptionForMembers).xss(true);
              groupFound.isOpenToAll = ((request.body.isOpenToAll) ? true : false);
              groupFound.save(function (err) {
                if (err) {
                  if (request.is('json')) {
                    response.json(400, {'error': err.message});
                  } else {
                    request.flash('error', err.message);
                    response.redirect('back');
                  }
                }
                if (request.is('json')) {
                  response.json(201, {'success': 'Group updated!'});
                } else {
                  request.flash('success', 'Group updated!');
                  response.redirect('back');
                }
              });
            } else {
              if (request.is('json')) {
                response.json(403, {'error': 'You are not admin of this group, you can not edit it!'});
              } else {
                request.flash('error', 'You are not admin of this group, you can not edit it!');
                response.redirect('back');
              }
            }
          });
        } else {
          response.send(404);
        }
      });
    } else {
      response.send(401);
    }
  });

  //send comment
  kabam.app.post('/api/groups/createMessage/:id', function (request, response) {
    request.model.groups.findOne({'_id': request.params.id}, function (err, groupFound) {
      if (err) {
        if (request.is('json')) {
          response.json(400, {'error': err.message});
        } else {
          request.flash('error', err.message);
          response.redirect('back');
        }
      }
      if (groupFound) {
        groupFound.checkRights(request.user, function (err1, role) {
          if (err1) {
            if (request.is('json')) {
              response.json(400, {'error': err1.message});
            } else {
              request.flash('error', err1.message);
              response.redirect('back');
            }
          }
          if (role === 'admin' || role === 'member') {
            request.model.groupMessages.create({
              'groupId': groupFound._id,
              'userId': request.user._id,
              'message': sanitaze(request.body.message).xss(true),
              'user': request.user._id
            }, function (err2, messageCreated) {
              if (err2) {
                throw err2;
              }
              if (messageCreated) {
                if (request.is('json')) {
                  response.send(201);
                } else {
                  request.flash('success', 'You have created message in this group!');
                  response.redirect('back');
                }
              } else {
                if (request.is('json')) {
                  response.json(403, {'error': 'Unable to post message.'});
                } else {
                  request.flash('error', 'Unable to post message.');
                  response.redirect('back');
                }
              }
            });
          } else {
            if (request.is('json')) {
              response.json(403, {'error': 'Unable to post message. You are not a member of this group!'});
            } else {
              request.flash('error', 'Unable to post message. You are not a member of this group!');
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
  kabam.app.post('/api/groups/join/:id', function (request, response) {
    if (request.user) {
      request.model.groups.findOne({'_id': request.params.id}, function (err, groupFound) {
        if (err) {
          if (request.is('json')) {
            response.json(400, {'error': err.message});
          } else {
            request.flash('error', err.message);
            response.redirect('back');
          }
        } else {
          if (groupFound) {
            if (groupFound.isOpenToAll) {
              groupFound.inviteMember(request.user, function (err1) {
                if (err1) {
                  if (request.is('json')) {
                    response.json(400, {'error': err1.message});
                  } else {
                    request.flash('error', err1.message);
                    response.redirect('back');
                  }
                }
                if (request.is('json')) {
                  response.json(201, {'status': 'Welcome to group!'});
                } else {
                  request.flash('success', 'Welcome to group!');
                  response.redirect('back');
                }
              });
            } else {
              if (request.is('json')) {
                response.json(403, {'error': 'Unable to enter group. You have to be invited by administrator!'});
              } else {
                request.flash('error', 'Unable to enter group. You have to be invited by administrator!');
                response.redirect('back');
              }
            }
          } else {
            if (request.is('json')) {
              response.json(404, {'error': 'Unable to find group.'});
            } else {
              request.flash('error', 'Unable to find group.');
              response.redirect('back');
            }
          }
        }
      });
    } else {
      response.send(401);
    }
  });
  //leave group
  kabam.app.post('/api/groups/leave/:id', function (request, response) {
    request.flash('error', 'Sorry, it doesn\'t work for now(');
    response.redirect('back');
  });

  //admin can invite or ban users from this group...
  kabam.app.post('/api/groups/invite/:id', function (request, response) {
    if (request.user) {
      async.parallel({
        'userFound': function (cb) {
          request.model.User.findOneByLoginOrEmail(request.body.username, cb);
        },
        'groupFound': function (cb) {
          request.model.groups.findOne({'_id': request.params.id}, cb);
        }
      }, function (err, obj) {
        if (err) {
          if (request.is('json')) {
            response.json(400, {'error': err.message});
          } else {
            request.flash('error', err.message);
            response.redirect('back');
          }
        }
        console.log(obj);

        if (obj.userFound && obj.groupFound) {
          obj.groupFound.checkRights(request.user, function (err2, role) {
            if (err2) {
              if (request.is('json')) {
                response.json(400, {'error': err2.message});
              } else {
                request.flash('error', err2.message);
                response.redirect('back');
              }
            }
            if (role === 'admin') {
              obj.groupFound.inviteMember(obj.userFound, function (err3) {
                if (err3) {
                  if (request.is('json')) {
                    response.json(400, {'error': err3.message});
                  } else {
                    request.flash('error', err3.message);
                    response.redirect('back');
                  }
                }
                if (request.is('json')) {
                  response.json(201, {'success': 'User has been invited to group!'});
                } else {
                  request.flash('success', 'User has been invited to group!');
                  response.redirect('back');
                }
              });
            } else {
              if (request.is('json')) {
                response.json(404, {'error': 'Unable to invite user to this group. You are not admin!'});
              } else {
                request.flash('error', 'Unable to invite user tp group. You are not admin of this group!');
                response.redirect('back');
              }
            }
          });
        } else {
          if (request.is('json')) {
            response.json(404, {'error': 'Unable to find group or user.'});
          } else {
            request.flash('error', 'Unable to find group or user.');
            response.redirect('back');
          }
        }
      });
    } else {
      response.send(401);
    }
  });
  kabam.app.post('/api/groups/ban/:id', function (request, response) {
    if (request.user) {
      async.parallel({
        'userFound': function (cb) {
          request.model.User.findOneByLoginOrEmail(request.body.username, cb);
        },
        'groupFound': function (cb) {
          request.model.groups.findOne({'_id': request.params.id}, cb);
        }
      }, function (err, obj) {
        if (err) {
          if (request.is('json')) {
            response.json(400, {'error': err.message});
          } else {
            request.flash('error', err.message);
            response.redirect('back');
          }
        }
        if (obj.userFound && obj.groupFound) {
          obj.groupFound.checkRights(request.user, function (err2, role) {
            if (err2) {
              if (request.is('json')) {
                response.json(400, {'error': err2.message});
              } else {
                request.flash('error', err2.message);
                response.redirect('back');
              }
            }
            if (role === 'admin') {
              obj.groupFound.ban(obj.userFound, function (err3) {
                if (err3) {
                  if (request.is('json')) {
                    response.json(400, {'error': err3.message});
                  } else {
                    request.flash('error', err3.message);
                    response.redirect('back');
                  }
                }
                if (request.is('json')) {
                  response.json(201, {'success': 'User has been banned from this group!'});
                } else {
                  request.flash('error', 'User has been banned from this group!');
                  response.redirect('back');
                }
              });
            } else {
              if (request.is('json')) {
                response.json(404, {'error': 'Unable to invite user to this group. You are not admin!'});
              } else {
                request.flash('error', 'Unable to invite user tp group. You are not admin of this group!');
                response.redirect('back');
              }
            }
          })
        } else {
          if (request.is('json')) {
            response.json(404, {'error': 'Unable to find group or user.'});
          } else {
            request.flash('error', 'Unable to find group or user.');
            response.redirect('back');
          }
        }
      });
    } else {
      response.send(401);
    }
  });

};
