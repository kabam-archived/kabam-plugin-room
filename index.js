var slugify = require('slugify'),
  async = require('async');

exports.name = "kabamPluginRoom";

exports.extendModel({
'groupMessages': function(kernel){
  var GroupMessagesSchema = new kabam.mongoose.Schema({
    'groupId': mongoose.Schema.Types.ObjectId,
    'userId': mongoose.Schema.Types.ObjectId,
    'message': String,
    'user':{
      'username': String,
      'firstName': String,
      'lastName': String,
      'gravatar': String,
    },
    'createdAt': Date
  });

  return kabam.mongoConnection.model('groupMessages', GroupMessagesSchema);
},
'groups': function(kernel){
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


    'school_id': mongoose.Schema.Types.ObjectId,

    'course_id': mongoose.Schema.Types.ObjectId,

    'descriptionPublic': String,
    'descriptionForMembers': String,

    'members':[{
      '_id': mongoose.Schema.Types.ObjectId,
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

  GroupsSchema.methods.findRoleInThisGroup(usernameOrEmailOrUserObject){
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

  GroupsSchema.methods.checkRights(usernameOrEmailOrUserObject,callback){
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
}});
