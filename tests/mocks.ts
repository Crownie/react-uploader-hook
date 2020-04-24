import {AxiosRequestConfig} from 'axios';

export const successfulUpload = async ({
  onUploadProgress,
}: AxiosRequestConfig) => {
  if (onUploadProgress) {
    const total = 100;
    await delay(500);
    onUploadProgress({total, loaded: 25});
    await delay(500);
    onUploadProgress({total, loaded: 50});
    await delay(500);
    onUploadProgress({total, loaded: 100});
  }
  return Promise.resolve({
    status: 200,
    data: {uploadedUrl: 'http://dummy.com/image.jpg'},
  });
};

export const successfulUploadWithoutProgress = async ({
  onUploadProgress,
}: AxiosRequestConfig) => {
  if (onUploadProgress) {
    const total = 100;
    onUploadProgress({total, loaded: 100});
  }
  return Promise.resolve({
    status: 200,
    data: {uploadedUrl: 'http://dummy.com/image.jpg'},
  });
};

export const failedUpload = async () => {
  return Promise.reject({
    response: {status: 403, data: {message: 'unauthorized'}},
  });
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
