const Pusher = require('pusher');

const pusher = new Pusher({
  appId: "1816841",
  key: "fdbc9ff346ce4463966c",
  secret: "b8f5f2310869942fcb6c",
  cluster: "eu",
  useTLS: true
});

module.exports = pusher;