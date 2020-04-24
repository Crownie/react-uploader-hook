# React Uploader Hook

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Github License][license-image]][license-url]

> React Uploader Hook is a hook simply for file upload
> It can be used with `react-dropzone` or a simple `<input type="file"/>`
> The key is calling the `onDrop(files)` with an array of `File`

## Install

```bash
// npm
npm install react-uploader-hook

// or yarn
yarn add react-uploader-hook
```

## Usage

```typescript jsx
import React, {useCallback, useState} from 'react';
import useFileUploader from 'react-uploader-hook';

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const getUploadParams = useCallback(() => {
    // [💡] you can return custom request configurations here
    return {method: 'put', url: 'http://dummyfile.io/api/upload'};
  }, []);

  const onUploaded = useCallback((fileBag) => {
    // [💡] do whatever with the uploaded files
    setUploadedFiles((prev) => [...prev, fileBag]);
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
      <pre>{JSON.stringify(fileBags)}</pre>
    </div>
  );
};
```

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/react-uploader-hook.svg?style=flat
[npm-url]: https://www.npmjs.com/package/react-uploader-hook
[travis-image]: https://travis-ci.org/Crownie/react-uploader-hook.svg?branch=master
[travis-url]: https://travis-ci.org/github/Crownie/react-uploader-hook
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://raw.githubusercontent.com/Crownie/react-uploader-hook/master/LICENSE.md
