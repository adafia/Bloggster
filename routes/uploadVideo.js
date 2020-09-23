const { S3 } = require('aws-sdk');
const uuid = require('uuid/v1');
const keys = require('../config/keys');

const s3 = new S3({
  region: 'eu-west-2',
  accessKeyId: keys.accessKeyId2,
  secretAccessKey: keys.secretAccessKey2,
});

const BUCKET_NAME = 'test-video-upload-filmo';
const file_key = uuid()

module.exports = app => {
  app.get('/api/start-upload', (req, res) => {
    try {
      const key = `${req.user.id}/${file_key}.mp4`;
      let params = {
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: req.query.fileType,
      };

      return new Promise((resolve, reject) =>
        s3.createMultipartUpload(params, (err, uploadData) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.send({ uploadId: uploadData.UploadId }));
          }
        })
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        status: 500,
        error: err.message,
      });
    }
  });

  app.get('/api/get-upload-url', async (req, res) => {
    try {
      const key = `${req.user.id}/${file_key}.mp4`;
      let params = {
        Bucket: BUCKET_NAME,
        Key: key,
        PartNumber: req.query.partNumber,
        UploadId: req.query.uploadId,
      };

      return new Promise((resolve, reject) =>
        s3.getSignedUrl('uploadPart', params, (err, presignedUrl) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.send({ presignedUrl }));
          }
        })
      );
    } catch (err) {
      console.log(err);
      return err;
    }
  });

  app.post('/api/complete-upload', async (req, res) => {
    try {
      const key = `${req.user.id}/${file_key}.mp4`;
      console.log(req.body, ': body');
      let params = {
        Bucket: BUCKET_NAME,
        Key: key,
        MultipartUpload: {
          Parts: req.body.params.parts,
        },
        UploadId: req.body.params.uploadId,
      };
      console.log(params);
      return new Promise((resolve, reject) =>
        s3.completeMultipartUpload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            console.log(':::::::::::>>>>',data)
            resolve(res.send({ data }));
          }
        })
      );
    } catch (err) {
      console.log(err);
      return err;
    }
  });
};
