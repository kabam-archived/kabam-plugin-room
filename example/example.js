var Kabam = require('kabam-kernel'),
  path = require('path'),
  async = require('async'),
  views = path.resolve(__dirname, './../', 'assets/views/');

var kabam = Kabam({
  'hostUrl': ((process.env.hostUrl) ? (process.env.hostUrl) : 'http://vvv.msk0.ru/'),
  'views': views
});

//basic frontend
kabam.usePlugin(require('kabam-plugin-hogan'));
kabam.usePlugin(require('kabam-plugin-welcome'));
kabam.usePlugin(require('kabam-plugin-my-profile'));
kabam.usePlugin(require('kabam-plugin-logger-http-mongo'));
kabam.usePlugin(require('kabam-plugin-logger-error-mongo'));

kabam.usePlugin(require('./../index.js'));

kabam.extendRoutes(function (kernel) {
  kernel.app.get('/', function (request, response) {
    response.redirect('/h');
  });
  kernel.app.get('/h_init', function (request, response) {
    if (request.user) {
      async.waterfall([
        function (cb) {
          var num = Math.floor(10000 * Math.random());
          request.model.groups.create({
              'name': 'Test school ' + num,
              'uri': 'test_school_' + num,
              'descriptionPublic': 'Description for visitors of school ' + num,
              'descriptionForMembers': 'Description for members of school' + num,
              'tier': 1,
              'isOpenToAll': true,
              'members': [
                {
                  'user': request.user._id,
                  'role': 'admin'
                }
              ]
            },
            function (err, schoolCreated) {
              cb(err, schoolCreated);
            });
        },
        function (school, cb) {
          var num = Math.floor(10000 * Math.random());
          request.model.groups.create({
              'name': 'Test course ' + num,
              'uri': 'test_course_' + num,
              'descriptionPublic': 'Description for visitors of course ' + num,
              'descriptionForMembers': 'Description for members of course ' + num,
              'school_id': school._id,
              'tier': 2,
              'isOpenToAll': true,
              'members': [
                {
                  'user': request.user._id,
                  'role': 'admin'
                }
              ]
            },
            function (err, courseCreated) {
              cb(err, school, courseCreated);
            });
        },
        function (school, course, cb) {

          var num = Math.floor(10000 * Math.random());
          request.model.groups.create({
              'name': 'Test group ' + num,
              'uri': 'test_group_' + num,
              'descriptionPublic': 'Description for visitors of course ' + num,
              'descriptionForMembers': 'Description for members of course' + num,
              'school_id': school._id,
              'course_id': course._id,
              'tier': 3,
              'isOpenToAll': true,
              'members': [
                {
                  'user': request.user._id,
                  'role': 'admin'
                }
              ]
            },
            function (err, groupCreated) {
              cb(err, school, course, groupCreated);
            });
        },
        function (school, course, group, cb) {
          cb(null, {
            'school': school,
            'course': course,
            'group': group
          });
        }
      ], function (err, result) {
        response.json(result);
      });
    } else {
      response.send(403);
    }
  });
});
kabam.start();
/*/
 //for testing purpose, do not use in production!!!!!!!!!!!!!!!!

 kabam.model.User.findOne({'username':'vodolaz095'},function(err, userFound){
 if(err) throw err;
 if(userFound){
 userFound.root = true;
 userFound.save();
 console.log(userFound.username + ' is a root!');
 }
 });
 //*/