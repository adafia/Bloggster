const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
  region: 'eu-west-2',
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;

    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'bloggster-dev',
        ContentType: 'image/jpeg',
        Key: key,
      },
      (err, url) => res.send({ key, url })
    );
  });
};
