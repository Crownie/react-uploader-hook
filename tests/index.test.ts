import useFileUploader, {FileBag, FileUploaderProps} from '../src';
import {act, renderHook} from '@testing-library/react-hooks';
import axios from 'axios';
import {
  failedUpload,
  successfulUpload,
  successfulUploadWithoutProgress,
} from './mocks';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

const checkFileBag = (fileBag, expected) => {
  let fileBagObj = {...fileBag};
  const id = fileBagObj.id;
  delete fileBagObj.id;
  expect(fileBagObj).toEqual(expected);
  return id;
};

const file = new File(['(⌐□_□)'], 'chucknorris.png', {
  type: 'image/png',
});

it('returns correct object', async () => {
  const props: FileUploaderProps = {
    getUploadParams: (f) => {
      expect(f).toEqual(file);
      return {method: 'put', url: 'http://dummy.com/api/upload'};
    },
    onUploaded(fileBag: FileBag) {
      expect(fileBag.status).toEqual('uploaded');
      expect(fileBag.progress).toEqual(100);
    },
  };

  // init
  const {result, waitForNextUpdate} = renderHook(() => useFileUploader(props));

  expect(Object.keys(result.current)).toEqual([
    'onDrop',
    'fileBags',
    'retryUpload',
    'removeFileBag',
    'clearFileBags',
  ]);

  expect(result.current.fileBags).toEqual([]);

  mockAxios.request.mockImplementationOnce(successfulUpload);
  // upload
  act(() => {
    result.current.onDrop([file]);
  });

  expect(result.current.fileBags[0].status).toEqual('uploading');

  await waitForNextUpdate();

  checkFileBag(result.current.fileBags[0], {
    file: file,
    formattedSize: '12 B',
    progress: 25,
    status: 'uploading',
  });

  await waitForNextUpdate();

  checkFileBag(result.current.fileBags[0], {
    file: file,
    formattedSize: '12 B',
    progress: 50,
    status: 'uploading',
  });

  await waitForNextUpdate();

  checkFileBag(result.current.fileBags[0], {
    file: file,
    formattedSize: '12 B',
    progress: 100,
    status: 'uploaded',
    httpStatus: 200,
    responseData: {uploadedUrl: 'http://dummy.com/image.jpg'},
  });

  // clear
  act(() => {
    result.current.clearFileBags();
  });

  expect(result.current.fileBags).toEqual([]);
});

it('handles upload failure', async () => {
  const props = {
    getUploadParams() {
      return {method: 'put', url: 'http://dummy.com/api/upload'};
    },
  };

  // init
  const {result, waitForNextUpdate} = renderHook(() => useFileUploader(props));

  mockAxios.request.mockImplementationOnce(failedUpload);
  // upload
  act(() => {
    result.current.onDrop([file]);
  });

  await waitForNextUpdate();

  const id = checkFileBag(result.current.fileBags[0], {
    file: file,
    formattedSize: '12 B',
    progress: 0,
    status: 'failed',
    httpStatus: 403,
  });

  mockAxios.request.mockImplementationOnce(successfulUploadWithoutProgress);
  // retry
  act(() => {
    result.current.retryUpload(id);
  });

  await waitForNextUpdate();

  checkFileBag(result.current.fileBags[0], {
    file,
    formattedSize: '12 B',
    progress: 100,
    status: 'uploaded',
    responseData: {
      uploadedUrl: 'http://dummy.com/image.jpg',
    },
    httpStatus: 200,
  });

  // remove
  act(() => {
    result.current.removeFileBag(id);
  });

  expect(result.current.fileBags.length).toEqual(0);
});
