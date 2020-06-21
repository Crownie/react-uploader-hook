import useFileUploader, {FileBag, FileUploaderProps} from '../src';
import {act, renderHook} from '@testing-library/react-hooks';
import axios from 'axios';
import {
  failedUpload,
  failedUploadWithNoData,
  failedUploadWithNoResponse,
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
    onUploaded(fileBag: FileBag, allUploaded: FileBag[]) {
      expect(fileBag.status).toEqual('uploaded');
      expect(fileBag.progress).toEqual(100);
      expect(allUploaded).toEqual([fileBag]);
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
    responseData: {uploadedUrl: 'http://dummy.com/image.png'},
  });

  // clear
  act(() => {
    result.current.clearFileBags();
  });

  expect(result.current.fileBags).toEqual([]);

  // call onDrop with null
  act(() => {
    result.current.onDrop(null as any);
  });

  expect(result.current.fileBags).toEqual([]);
});

it('handles upload failure', async () => {
  const props = {
    getUploadParams() {
      return {method: 'put', url: 'http://dummy.com/api/upload'};
    },
    onUploaded: jest.fn(),
    onFailed: jest.fn(),
  };

  // init
  const {result, waitForNextUpdate} = renderHook(() => useFileUploader(props));

  mockAxios.request.mockImplementationOnce(failedUpload);
  // upload file
  act(() => {
    result.current.onDrop([file]);
  });

  await waitForNextUpdate();

  const expectedFileBag0 = {
    id: expect.stringMatching(/.*.png/),
    file: file,
    formattedSize: '12 B',
    progress: 0,
    status: 'failed',
    httpStatus: 403,
    responseData: {
      message: 'unauthorized',
    },
  };

  const id = result.current.fileBags[0].id;
  expect(props.onFailed).toHaveBeenCalledWith(expectedFileBag0, [
    expectedFileBag0,
  ]);

  mockAxios.request.mockImplementationOnce(failedUploadWithNoResponse);
  // retry - fail with no response
  act(() => {
    result.current.retryUpload(id);
  });

  await waitForNextUpdate();

  const expectedFileBag1 = {
    id: expect.stringMatching(/.*.png/),
    file,
    formattedSize: '12 B',
    progress: 0,
    status: 'failed',
    httpStatus: undefined,
    responseData: undefined,
  };
  expect(props.onFailed).toHaveBeenCalledWith(expectedFileBag1, [
    expectedFileBag1,
  ]);
  props.onFailed.mockClear();

  mockAxios.request.mockImplementationOnce(failedUploadWithNoData);
  // upload another to fail
  act(() => {
    result.current.onDrop([file]);
  });

  await waitForNextUpdate();

  // expect total 2 failedFileBags
  expect(props.onFailed).toHaveBeenCalledWith(expectedFileBag1, [
    expectedFileBag1,
    expectedFileBag1,
  ]);
  props.onFailed.mockClear();

  mockAxios.request.mockImplementationOnce(failedUploadWithNoData);
  // retry to fail
  act(() => {
    result.current.retryUpload(id);
  });
  await waitForNextUpdate();

  // expect total 2 failedFileBags
  expect(props.onFailed).toHaveBeenCalledWith(expectedFileBag1, [
    expectedFileBag1,
    expectedFileBag1,
  ]);
  props.onFailed.mockClear();

  mockAxios.request.mockImplementationOnce(successfulUploadWithoutProgress);
  // retry to succeed
  act(() => {
    result.current.retryUpload(id);
  });

  await waitForNextUpdate();

  const expectedFileBag2 = {
    id: expect.stringMatching(/.*.png/),
    file,
    formattedSize: '12 B',
    progress: 100,
    status: 'uploaded',
    responseData: {
      uploadedUrl: 'http://dummy.com/image.png',
    },
    httpStatus: 200,
  };

  expect(props.onUploaded).toHaveBeenCalledWith(expectedFileBag2, [
    expectedFileBag2,
  ]);

  // remove
  act(() => {
    result.current.removeFileBag(id);
  });
  // ensure fileBag is removed
  expect(result.current.fileBags.length).toEqual(1);
});

it('multiple successful uploads', async () => {
  const props: FileUploaderProps = {
    getUploadParams: (f) => {
      expect(f).toEqual(file);
      return {method: 'put', url: 'http://dummy.com/api/upload'};
    },
    onUploaded: jest.fn(),
  };

  // init
  const {result, waitForNextUpdate} = renderHook(() => useFileUploader(props));

  mockAxios.request.mockImplementationOnce(successfulUpload);
  // upload
  act(() => {
    result.current.onDrop([file]);
  });

  mockAxios.request.mockImplementationOnce(successfulUpload);
  // upload
  act(() => {
    result.current.onDrop([file]);
  });

  // steps through the progress update
  await waitForNextUpdate();
  await waitForNextUpdate();
  await waitForNextUpdate();

  const expectedFileBag = {
    file,
    formattedSize: '12 B',
    httpStatus: 200,
    id: expect.stringMatching(/.*.png/),
    progress: 100,
    responseData: {
      uploadedUrl: 'http://dummy.com/image.png',
    },
    status: 'uploaded',
    meta: undefined,
  };

  expect(props.onUploaded).toHaveBeenCalledWith(expectedFileBag, [
    expectedFileBag,
    expectedFileBag,
  ]);
});
