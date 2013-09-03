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
        return = 'visitor';
      }
    }
    return role;
  };

  GroupsSchema.methods.checkRights(usernameOrEmailOrUserObject,cb){
    async.parallel({
      'admin':function(cb){},
      'member':function(cb){}
    },cb);
  };

  GroupsSchema.methods.invite(usernameOrEmailOrUserObject,role, cb){}

  GroupsSchema.methods.inviteAdmin = function(usernameOrEmailOrUserObject){};

  GroupsSchema.methods.inviteUser = function(usernameOrEmailOrUserObject){};
  GroupsSchema.methods.sendMessage = function(usernameOrEmailOrUserObject, message){};

  return kabam.mongoConnection.model('groups', GroupsSchema);
}});
