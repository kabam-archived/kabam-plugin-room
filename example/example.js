var Kabam = require('kabam-kernel');

var kabam = Kabam({
  'hostUrl':'http://vvv.msk0.ru/'
});

//basic frontend
kabam.usePlugin(require('kabam-plugin-hogan'));
kabam.usePlugin(require('kabam-plugin-welcome'));

kabam.usePlugin(require('./../index.js'));

kabam.start();
