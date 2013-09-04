var slugify = require('slugify2'),
  async = require('async');

exports.name = "kabamPluginRoom";

exports.model={
'groupBlogs': function(kabam){
  var GroupBlogsSchema = new kabam.mongoose.Schema({
    'groupId': kabam.mongoose.Schema.Types.ObjectId,
    'title': String,
    'description':String,
    'keywords':String,
    'contentPublic':String,
    'contentForMembers':String,
    'createdAt': {type: Date, default: new Date()}
  });
  GroupBlogsSchema.index({ groupId:1, createdAt:1});
  return kabam.mongoConnection.model('groupBlogs', GroupBlogsSchema);
},
'groupMessages': function(kabam){
  var GroupMessagesSchema = new kabam.mongoose.Schema({
    'groupId': kabam.mongoose.Schema.Types.ObjectId,
    'userId': kabam.mongoose.Schema.Types.ObjectId,
    'message': String,
    'user':{
      'username': String,
      'firstName': String,
      'lastName': String,
      'gravatar': String
    },
    'createdAt': {type: Date, default: new Date()}
  });

  GroupMessagesSchema.index({ groupId:1, createdAt:1});
  return kabam.mongoConnection.model('groupMessages', GroupMessagesSchema);
},
'groups': function(kabam){
  var GroupsSchema = new kabam.mongoose.Schema({
    'name': {
      type: String,
      trim: true,
      index: true
    },
    'uri': {
      type: String,
      trim: true,
      index: true,
      default: function(){
        return slugify(this.name);
        }
    },
    'tier': {type: Number, min:0, max:3},

    'school_id': kabam.mongoose.Schema.Types.ObjectId,

    'course_id': kabam.mongoose.Schema.Types.ObjectId,

    'descriptionPublic': String,
    'descriptionForMembers': String,

    'members':[{
      '_id': kabam.mongoose.Schema.Types.ObjectId,
      'username': String,
      'gravatar': String,
      'firstName': String,
      'lastName': String,
      'role': String
    }],

    'isOpenToAll': {type: Boolean, default: false},
    'isOpenToParent': {type: Boolean, default: false}
  });

  GroupsSchema.index({ name:1, uri:1, school_id:1, course_id:1 });

  GroupsSchema.methods.findRoleInThisGroup=function(usernameOrEmailOrUserObject){
    var role = 'visitor';
    if(typeof usernameOrEmailOrUserObject === 'string'){
      this.members.map(function(member){
        if(member.username === usernameOrEmailOrUserObject.toString() || member.email === usernameOrEmailOrUserObject.toString()){
          role = member.role;
        }
      });
    } else {
      if(usernameOrEmailOrUserObject._id){
        this.members.map(function(member){
          if(member._id === usernameOrEmailOrUserObject._id){
            role = member.role;
          }
        });
      } else {
        role = 'visitor';
      }
    }
    return role;
  };

  GroupsSchema.methods.checkRights=function(usernameOrEmailOrUserObject,callback){
    var thisGroup = this;
    async.parallel({
      'inSchool':function(cb){
        if(this.school_id){
          Groups.findOne({'_id':this.school_id},function(err, schoolFound){
            cb(err, schoolFound.findRoleInThisGroup(usernameOrEmailOrUserObject));
          });
        } else {
          cb(null);
        }
      },
      'inCourse':function(cb){
        if(this.course_id){
          Groups.findOne({'_id':this.course_id},function(err, courseFound){
            cb(err, courseFound.findRoleInThisGroup(usernameOrEmailOrUserObject));
          });
        } else {
          cb(null);
        }
      },
      'inThisGroup':function(cb){
        cb(null,thisGroup.findRoleInThisGroup(usernameOrEmailOrUserObject));
      }
    }, callback);
  };

  GroupsSchema.methods.invite  = function(usernameOrEmailOrUserObject, role, callback){
    //todo
  };

  GroupsSchema.methods.inviteAdmin = function(usernameOrEmailOrUserObject,callback){
    this.invite(usernameOrEmailOrUserObject, 'admin', callback);
  };

  GroupsSchema.methods.inviteMember = function(usernameOrEmailOrUserObject, callback){
    this.invite(usernameOrEmailOrUserObject, 'member', callback);
  };

  GroupsSchema.methods.sendMessage = function(usernameOrEmailOrUserObject, message){

  };

  var Groups = kabam.mongoConnection.model('groups', GroupsSchema);
  return Groups;
}};



exports.routes = function(kabam){
  //get group homepage

  kabam.app.get(/\/h\/([a-z0-9_]+)\/?$/,function(request,response){
    response.send('tier1 group '+request.params[0]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/?$/,function(request,response){
    response.send('tier2 group '+request.params[0]+' '+request.params[1]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/?$/,function(request,response){
    response.send('tier3 group '+request.params[0]+' '+request.params[1]+' '+request.params[2]);
  });

  //get group blog
  kabam.app.get(/\/h\/([a-z0-9_]+)\/blog$/,function(request,response){
    response.send('tier1 group blog '+request.params[0]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/blog$/,function(request,response){
    response.send('tier2 group blog '+request.params[0]+' '+request.params[1]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/blog$/,function(request,response){
    response.send('tier3 group blog '+request.params[0]+' '+request.params[1]+' '+request.params[2]);
  });

  //get group members
  kabam.app.get(/\/h\/([a-z0-9_]+)\/members$/,function(request,response){
    response.send('tier1 group blog '+request.params[0]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/members$/,function(request,response){
    response.send('tier2 group blog '+request.params[0]+' '+request.params[1]);
  });

  kabam.app.get(/\/h\/([a-z0-9_]+)\/([a-z0-9_]+)\/([a-z0-9_]+)\/members$/,function(request,response){
    response.send('tier3 group blog '+request.params[0]+' '+request.params[1]+' '+request.params[2]);
  });


};