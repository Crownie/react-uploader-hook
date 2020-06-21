import {AxiosRequestConfig} from 'axios';

const uploadedUrl = 'http://dummy.com/image.png';

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
    data: {uploadedUrl},
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
    data: {uploadedUrl},
  });
};

export const failedUpload = async () => {
  return Promise.reject({
    response: {status: 403, data: {message: 'unauthorized'}},
  });
};

export const failedUploadWithNoResponse = async () => {
  return Promise.reject({});
};

export const failedUploadWithNoData = async () => {
  return Promise.reject({response: {}});
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
