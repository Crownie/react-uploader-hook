# React Uploader Hook

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
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

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/react-uploader-hook.svg?style=flat
[npm-url]: https://www.npmjs.com/package/react-uploader-hook
[travis-image]: https://travis-ci.org/Crownie/react-uploader-hook.svg?branch=master
[travis-url]: https://travis-ci.org/github/Crownie/react-uploader-hook
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://raw.githubusercontent.com/Crownie/react-uploader-hook/master/LICENSE.md
