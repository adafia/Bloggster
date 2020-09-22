import React, { Component } from 'react'
import axios from 'axios'

export default class Upload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileSelected: null,
      uploadId: '',
      fileName: '',
      backendUrl: 'http://localhost:5000'
    }
  }

  async fileHandler(event) {
    try {
      let fileSelected = event.target.files[0]
      let fileName = fileSelected.name
      this.setState({ fileSelected })
      this.setState({ fileName })
    } catch (err) {
      console.error(err, err.message) 
    }
  }

  async startUpload(event) {
    try {
      event.preventDefault()
      const params = {
        fileName: this.state.fileName,
        fileType: this.state.fileSelected.type
      };

      let resp = await axios.get(`/api/start-upload`, { params })
      let { uploadId } = resp.data
      console.log(':::::::::::::::::::>>',resp)
      this.setState({ uploadId })
      this.uploadMultipartFile()

    } catch (err) {
      console.log(err)
    }
  }

  async uploadMultipartFile() {
    try {
      console.log('Inside uploadMultipartFile')
      const CHUNK_SIZE = 10000000 // 10MB
      const fileSize = this.state.fileSelected.size
      const CHUNKS_COUNT = Math.floor(fileSize / CHUNK_SIZE) + 1
      let promisesArray = []
      let start, end, blob

      for (let index = 1; index < CHUNKS_COUNT + 1; index++) {
        start = (index - 1) * CHUNK_SIZE
        end = (index) * CHUNK_SIZE
        blob = (index < CHUNKS_COUNT) ? this.state.fileSelected.slice(start, end) : this.state.fileSelected.slice(start)

        // Get presigned URL for each part
        let getUploadUrlResp = await axios.get(`/api/get-upload-url`, {
          params: {
            fileName: this.state.fileName,
            partNumber: index,
            uploadId: this.state.uploadId
          }
        })

        let { presignedUrl } = getUploadUrlResp.data
        console.log('   Presigned URL ' + index + ': ' + presignedUrl + ' filetype ' + this.state.fileSelected.type)

        // Send part aws server
        let uploadResp = axios.put(presignedUrl, blob, {
          headers: {
            'Content-Type': this.state.fileSelected.type
          }
        });
        promisesArray.push(uploadResp)
      }

      let resolvedArray = await Promise.all(promisesArray)
      console.log(resolvedArray, ' resolvedAr')

      let uploadPartsArray = []
      resolvedArray.forEach((resolvedPromise, index) => {
        uploadPartsArray.push({
          ETag: resolvedPromise.headers.etag,
          PartNumber: index + 1
        })
      })

      // CompleteMultipartUpload in the backend server
      let completeUploadResp = await axios.post(`/api/complete-upload`, {
        params: {
          fileName: this.state.fileName,
          parts: uploadPartsArray,
          uploadId: this.state.uploadId
        }
      })

      console.log(completeUploadResp.data, "complete upload response")

    } catch (err) {
      console.log(err)
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.startUpload.bind(this)}>
          <div>
            <p>Upload Dataset:</p>
            <input type='file' id='file' onChange={this.fileHandler.bind(this)} />
            <button type='submit'>
              Upload
            </button>
          </div>
        </form>
      </div>
    )
  }
}