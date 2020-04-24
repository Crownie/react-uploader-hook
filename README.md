# React Uploader Hook

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![codecov](https://codecov.io/gh/Crownie/react-uploader-hook/branch/master/graph/badge.svg)](https://codecov.io/gh/Crownie/react-uploader-hook)
[![Github License][license-image]][license-url]

> React Uploader Hook is a hook simply for file upload
> It can be used with [`react-dropzone`](https://www.npmjs.com/package/react-dropzone) or a simple `<input type="file"/>`
> The key is calling the `onDrop(files)` with `FileList` or an array of `File`

🖥️[Live Example](https://codesandbox.io/s/react-uploader-hook-example-b1w5q?file=/src/App.js)

## Install

```bash
// npm
npm install react-uploader-hook

// or yarn
yarn add react-uploader-hook
```

## Usage

```typescript jsx
import React, {useCallback} from 'react';
import useFileUploader from 'react-uploader-hook';

const App = () => {
  const getUploadParams = useCallback((file) => {
    // [💡] you can return custom request configurations here
    const form = new FormData();
    form.append('file', file);
    return {
      method: 'post',
      url: 'https://file.io?expires=1w',
      headers: {'Content-Type': 'multipart/form-data'},
      data: form,
      meta: {'any-other-stuff': 'hello'},
    };
  }, []);

  const onUploaded = useCallback((fileBag) => {
    // [💡] do whatever with the uploaded files
  }, []);

  // [⭐]
  const {onDrop, fileBags} = useFileUploader({getUploadParams, onUploaded});

  const handleChange = useCallback(
    (event) => {
      onDrop(event.target.files);
    },
    [onDrop],
  );

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <pre>{JSON.stringify(fileBags, null, 2)}</pre>
    </div>
  );
};
```

### Functions and parameters

`useFileUploader()` takes in an object of type `FileUploaderProps` as an argument

```typescript jsx
export interface FileUploaderProps {
  getUploadParams: (file: File) => Promise<UploadParams> | UploadParams;
  onUploaded?: (fileBag: FileBag) => void;
  onFailed?: (fileBag: FileBag) => void;
}
```

### getUploadParams()

This is a callback function that will be called before a request is sent to the server to upload each file.
The function must return an object in the following shape

```typescript jsx
export interface UploadParams {
  url: string;
  method: 'put' | 'post' | 'patch' | string;
  headers?: {[key: string]: any};
  data?: any; // the file to upload or FormData in the case of multipart form
  meta?: {[key: string]: any}; // any extra data to forward to the FileBag.meta
}
```

### onUploaded()

This function will be called on successful upload of each file. The first argument will be `fileBag`, a wrapper object for the uploaded file
the status field will contain the value `'uploaded'` and `'progress'` 100

```typescript jsx
export interface FileBag {
  id: string;
  file: File;
  uploadUrl: string;
  progress: number; // 0 - 100
  formattedSize: string;
  status: 'uploading' | 'uploaded' | 'failed';
  httpStatus: number; // 200, 404 etc.
  message: string;
  responseData: any; // the response body from the server
  meta?: {[key: string]: any}; // any extra data forwarded from getUploadParams()
}
```

### onFailed()

Similar to onUploaded(), however the status will be `'failed'`. `httpStatus` and `responseData` would
contain additional information to know why the upload failed.

### onDrop()

Call this function to trigger an upload. It accepts File[] or FileList as argument

## retryUpload()

Call this function to retry a failed upload, Tt accepts the fileBag id as argument

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/react-uploader-hook.svg?style=flat
[npm-url]: https://www.npmjs.com/package/react-uploader-hook
[travis-image]: https://travis-ci.org/Crownie/react-uploader-hook.svg?branch=master
[travis-url]: https://travis-ci.org/github/Crownie/react-uploader-hook
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://raw.githubusercontent.com/Crownie/react-uploader-hook/master/LICENSE.md
