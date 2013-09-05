var Kabam = require('kabam-kernel'),
  path = require('path'),
  async = require('async'),
  views = path.resolve(__dirname, './../', 'assets/views/');

var kabam = Kabam({
  'hostUrl': 'http://vvv.msk0.ru/',
  'views': views
});

console.log(views);

//basic frontend
kabam.usePlugin(require('kabam-plugin-hogan'));
kabam.usePlugin(require('kabam-plugin-welcome'));

kabam.usePlugin(require('./../index.js'));

kabam.extendRoutes(function (kernel) {
  kernel.app.get('/h_init', function (request, response) {
    if (request.user) {
      async.waterfall([
        function (cb) {
          var num = Math.floor(10000 * Math.random());
          request.model.groups.create({
              'name': 'Test school ' + num,
              'uri': 'test_school_' + num,
              'descriptionPublic': 'Description for visitors of school '+num,
              'descriptionForMembers': 'Description for members of school'+num,
              'tier': 1,
              'members': [
                {
                  '_id': request.user._id,
                  'username': request.user.username,
                  'gravatar': request.user.gravatar,
                  'firstName': request.user.firstName,
                  'lastName': request.user.lastName,
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
              'members': [
                {
                  '_id': request.user._id,
                  'username': request.user.username,
                  'gravatar': request.user.gravatar,
                  'firstName': request.user.firstName,
                  'lastName': request.user.lastName,
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
              'members': [
                {
                  '_id': request.user._id,
                  'username': request.user.username,
                  'gravatar': request.user.gravatar,
                  'firstName': request.user.firstName,
                  'lastName': request.user.lastName,
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
        },
      ], function (err, result) {
        response.json(result);
      });
    } else {
      response.send(403);
    }
  });
});
kabam.start();
console.log(kabam.app.get('views'));