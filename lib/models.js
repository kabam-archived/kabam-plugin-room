var slugify = require('slugify2'),
  async = require('async');

exports = module.exports = {
  'groupBlogs': function (kabam) {
    var GroupBlogsSchema = new kabam.mongoose.Schema({
      'groupId': kabam.mongoose.Schema.Types.ObjectId,
      'title': String,
      'description': String,
      'keywords': String,
      'contentPublic': String,
      'contentForMembers': String,
      'createdAt': {type: Date, default: new Date()}
    });
    GroupBlogsSchema.index({ groupId: 1, createdAt: 1});
    return kabam.mongoConnection.model('groupBlogs', GroupBlogsSchema);
  },
  'groupMessages': function (kabam) {
    var GroupMessagesSchema = new kabam.mongoose.Schema({
      'groupId': kabam.mongoose.Schema.Types.ObjectId,
      'userId': kabam.mongoose.Schema.Types.ObjectId,
      'message': String,
      'user': {
        'username': String,
        'firstName': String,
        'lastName': String,
        'gravatar': String
      },
      'createdAt': {type: Date, default: new Date()}
    });

    GroupMessagesSchema.index({ groupId: 1, createdAt: 1});
    return kabam.mongoConnection.model('groupMessages', GroupMessagesSchema);
  },
  'groups': function (kabam) {
    var GroupsSchema = new kabam.mongoose.Schema({
      'name': {
        type: String,
        trim: true,
        index: true
      },
      'uri': {
        type: String,
        trim: true,
        index: true
      },
      //0 - world, 1 - school, 2 - course/association, 3 - group
      'tier': {type: Number, min: 0, max: 3},

      'school_id': kabam.mongoose.Schema.Types.ObjectId,

      'course_id': kabam.mongoose.Schema.Types.ObjectId,

      'descriptionPublic': String,
      'descriptionForMembers': String,

      'members': [
        {
          '_id': kabam.mongoose.Schema.Types.ObjectId,
          'username': String,
          'gravatar': String,
          'firstName': String,
          'lastName': String,
          'role': String
        }
      ],

      'isOpenToAll': {type: Boolean, default: false},
      'isOpenToParent': {type: Boolean, default: false}
    });

    GroupsSchema.index({ name: 1, uri: 1, school_id: 1, course_id: 1 });

    GroupsSchema.methods.findRoleInThisGroup = function (user) {
      var role = 'visitor';
      this.members.map(function (member) {
        if (member.username == user.username) {
          console.log('role found');
          role = member.role;
        }
      });
      return role;
    };

    GroupsSchema.methods.checkRights = function (user, callback) {
      var thisGroup = this;
      if(!user){
        callback(null, 'visitor');//non authorized user is visitor
        return;
      }

      if(user.hasRole('helpdesk')){ //helpdesk is member of every group
        callback(null, 'member');
        return;
      }

      if(user.root || user.hasRole('hadmin')){
        callback(null,'admin'); //roots and hierarchy admins are admins of every group
      } else {
        async.parallel({
          'inSchool': function (cb) {
            if (this.school_id) {
              Groups.findOne({'_id': this.school_id}, function (err, schoolFound) {
                cb(err, schoolFound.findRoleInThisGroup(user));
              });
            } else {
              cb(null);
            }
          },
          'inCourse': function (cb) {
            if (this.course_id) {
              Groups.findOne({'_id': this.course_id}, function (err, courseFound) {
                cb(err, courseFound.findRoleInThisGroup(user));
              });
            } else {
              cb(null);
            }
          },
          'inThisGroup': function (cb) {
            cb(null, thisGroup.findRoleInThisGroup(user));
          }
        }, function(err,roles){
          //school
          if(thisGroup.tier === 1){
            callback(err, roles.inThisGroup);
            return;
          }

          //for course // association
          //if user is admin of school, he is admin of every course of school
          if(thisGroup.tier === 2){
            if(roles.inSchool === 'admin' || roles.inThisGroup === 'admin'){
              callback(err,'admin');
            } else {
              callback(err, roles.inThisGroup);
            }
            return;
          }

          //for students group
          //if user is admin of school/course, he is admin of every in course group
          if(thisGroup.tier === 3){
            if(roles.inSchool === 'admin' || roles.inCourse === 'admin' || roles.inThisGroup === 'admin'){
              callback(err,'admin');
            } else {
              callback(err, roles.inThisGroup);
            }
            return;
          }

          callback(err, 'visitor'); //something strange
        });
      }
    };

    GroupsSchema.methods.invite = function (user, role, callback) {
      var userIsNotMember = true;
      this.members.map(function(member){
        if(member.username === user.username){
          userIsNotMember = false
        }
      });
      if(userIsNotMember){
        this.members.push({
          '_id': user._id,
          'username': user.username,
          'gravatar': user.gravatar,
          'firstName': user.firstName,
          'lastName': user.lastName,
          'role': role
        });
        this.save(callback);
      } else {
        callback(new Error('User is already in this group!'));
      }
    };

    GroupsSchema.methods.ban = function(user,callback){
      for (var i=0; i<this.members.length; i++){
        if(this.members[i].username === user.username){
          this.members.splice(i,1);
          break;
        }
      }
      this.save(callback);
    };

    GroupsSchema.methods.inviteAdmin = function (usernameOrEmailOrUserObject, callback) {
      this.invite(usernameOrEmailOrUserObject, 'admin', callback);
    };

    GroupsSchema.methods.inviteMember = function (usernameOrEmailOrUserObject, callback) {
      this.invite(usernameOrEmailOrUserObject, 'member', callback);
    };

    GroupsSchema.methods.getParent = function(callback){
      switch(this.tier) {
        case 2:
          Groups.findOne({'_id':this.school_id, tier: 1},callback);
          break;
        case 3:
          Groups.findOne({'_id':this.course_id, tier: 2},callback);
          break;
        default:
          callback(null,null);
      }
    };

    GroupsSchema.methods.getChildren = function(callback){
      switch(this.tier) {
        case 1:
          Groups.find({'school_id':this._id, tier: 2},callback);
          break;
        case 2:
          Groups.find({'course_id':this._id, tier: 3},callback);
          break;
        default:
          callback(null,null);
      }
    };

    GroupsSchema.methods.sendMessage = function (usernameOrEmailOrUserObject, message, callback) {};

    //get blog entries suitable for this particular user
    GroupsSchema.methods.getBlog = function (user, callback) {};

    //export group as JSON object that can be viewed by this particular user
    GroupsSchema.methods.export = function(user, callback){
      var ret = {},
        thisGroup = this;

      async.parallel(
        {
          'name':function(cb){
            cb(null, thisGroup.name);
          },
          '_id':function(cb){
            cb(null, thisGroup._id);
          },
          'parent':function(cb){
            thisGroup.getParent(cb);
          },
          'uri':function(cb){
            cb(null, thisGroup.uri);
          },
          'blog':function(cb){
            cb(null,[]);
          },
          'members':function(cb){
            cb(null, thisGroup.members);
          },
          'children':function(cb){
            thisGroup.getChildren(cb);
          },
          'parentUri':function(cb){
            cb(null, thisGroup.parentUri);
          },
          'childrenUri':function(cb){
            cb(null, thisGroup.childrenUri);
          },
          'homepage':function(cb){
            thisGroup.checkRights(user, function(err, roles){
              switch(roles){
                case 'admin':
                  cb(err,{
                    'isAdmin':true,
                    'isMember':true,
                    'role':'administrator',
                    'descriptionPublic':thisGroup.descriptionPublic,
                    'descriptionForMembers':thisGroup.descriptionForMembers
                  });
                  break;
                case 'member':
                  cb(err,{
                    'isAdmin':false,
                    'isMember':true,
                    'role':'member',
                    'descriptionPublic':thisGroup.descriptionPublic,
                    'descriptionForMembers':thisGroup.descriptionForMembers
                  });
                  break;

                default: //visitor.. or something other
                  cb(err,{
                    'isAdmin':false,
                    'isMember':false,
                    'role':'visitor',
                    'descriptionPublic':thisGroup.descriptionPublic
                  });
              }
            });
          }
        },callback);
    };

    GroupsSchema.statics.findGroup = function (schoolUri, courseUri, groupUri, callback) {
      var groups = this;

      if (schoolUri && !courseUri && !groupUri && typeof callback === 'function') {
        //we try to find school by school uri
        groups.findOne({'uri': schoolUri, 'tier': 1}, function(err,schoolFound){
          if(err){
            callback(err);
          } else {
            if(schoolFound){
              schoolFound.parentUri = null;
              schoolFound.childrenUri = '/h/'+schoolFound.uri;
              callback(null,schoolFound);
            } else {
              callback(null,null);
            }
          }
        });
        return;
      }

      if (schoolUri &&  courseUri  && !groupUri && typeof callback === 'function') {
        async.waterfall(
          [
            function (cb) {
              groups.findOne({'uri': schoolUri, 'tier': 1}, function (err, schoolFound) {
                cb(err, schoolFound);
              });
            },
            function (school, cb) {
              if (school && school._id) {//school found
                groups.findOne({'uri': courseUri, 'tier': 2, 'school_id': school._id}, function (err, courseFound) {
                  cb(err, school, courseFound);
                });
              } else {
                cb(null, null, null)
              }

            },
            function (school, course, cb) {
              if (course) {
                course.school = school;
                course.parentUri = '/h/'+school.uri;
                course.childrenUri = '/h/'+school.uri+'/'+course.uri;
                cb(null, course);
              } else {
                cb(null, null);
              }
            }
          ], callback);
        return;
      }

      if (schoolUri &&  courseUri  && groupUri && typeof callback === 'function') {
        async.waterfall(
          [
            function (cb) {
              groups.findOne({'uri': schoolUri, 'tier': 1}, function (err, schoolFound) {
                cb(err, schoolFound);
              });
            },
            function (school, cb) {
              if (school && school._id) {//school found
                groups.findOne({'uri': courseUri, 'tier': 2, 'school_id': school._id}, function (err, courseFound) {
                  cb(err, school, courseFound);
                });
              } else {
                cb(null, null, null)
              }
            },
            function (school, course, cb) {
              if (school && course && school._id && course._id) {
                groups.findOne({'uri': groupUri, 'tier': 3, 'school_id': school._id, 'course_id': course._id}, function (err, groupFound) {
                  cb(err, school, course, groupFound);
                });
              } else {
                cb(null, null, null, null);
              }
            },
            function (school, course, group, cb) {
              if (group) {
                group.school = school;
                group.course = course;
                group.parentUri = '/h/'+school.uri+'/'+course.uri;
                group.childrenUri = null;
                cb(null, group);
              } else {
                cb(null, null);
              }
            }
          ], callback);
        return;
      }
    };


    var Groups = kabam.mongoConnection.model('groups', GroupsSchema);
    return Groups;
  }};
