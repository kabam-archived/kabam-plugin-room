var slugify = require('slugify');

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
      unique: true,
      index: true
    },
    'uri': {
      type: String,
      trim: true,
      unique: true,
      index: true,
      default: function(){
        return slugify(this.name);
        }
    },
    'parent':{
      '_id': mongoose.Schema.Types.ObjectId,
      'name': String,
      'uri': String
    },
    'description': String,
    'members':[{
      '_id': mongoose.Schema.Types.ObjectId,
      'username': String,
      'gravatar': String,
      'firstName': String,
      'lastName': String
    }],
    'admins':[{
      '_id': mongoose.Schema.Types.ObjectId,
      'username': String,
      'gravatar': String,
      'firstName': String,
      'lastName': String
    }]
  });

  GroupsSchema..index({ name:1, uri:1, parent:1 });
  GroupsSchema.methods.inviteAdmin = function(usernameOrEmailOrUserObject){};
  GroupsSchema.methods.removeAdmin = function(usernameOrEmailOrUserObject){};

  GroupsSchema.methods.inviteUser = function(usernameOrEmailOrUserObject){};
  GroupsSchema.methods.removeUser = function(usernameOrEmailOrUserObject){};

  GroupsSchema.methods.sendMessage = function(usernameOrEmailOrUserObject, message){};

  return kabam.mongoConnection.model('groups', GroupsSchema);
}});
