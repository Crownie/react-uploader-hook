import axios from 'axios';
import {useCallback, useEffect, useState} from 'react';
import {FileBag} from './file-bag';
import {formatFileSize} from './utils';

export interface UploadParams {
  url: string;
  method: 'put' | 'post' | 'patch' | string;
  headers?: {[key: string]: any};
  data?: any;
  meta?: {[key: string]: any}; // any extra data to forward to the FileBag.meta
}

export interface FileUploaderProps {
  getUploadParams: (file: File) => Promise<UploadParams> | UploadParams;
  onUploaded?: (fileBag: FileBag, allUploaded: FileBag[]) => void;
  onFailed?: (fileBag: FileBag, allFailed: FileBag[]) => void;
}

export interface FileUploader {
  onDrop: (files: File[] | FileList) => void;
  fileBags: FileBag[];
  retryUpload: (id: string) => void;
  removeFileBag: (id: string) => void;
  clearFileBags: () => void;
}

export default function useFileUploader({
  getUploadParams,
  onUploaded,
  onFailed,
}: FileUploaderProps): FileUploader {
  const [fileBags, setFileBags] = useState<FileBag[]>([]);
  const [newFileBags, setNewFileBags] = useState<FileBag[]>([]);

  const findFileBagIndexById = useCallback(
    (id) => {
      let index = -1;
      for (let i = 0; i < fileBags.length; i++) {
        if (fileBags[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    },
    [fileBags],
  );

  const updateFileBag = useCallback(
    async (
      id,
      data: FileBag | any,
    ): Promise<{updatedFileBag: FileBag; fileBags: FileBag[]}> => {
      // looks nasty. this is updating the fileBags and also making sure that it can return the latest data
      const {updatedFileBag, fileBags} = await new Promise((resolve) => {
        setFileBags((prevFileBags) => {
          let index = findFileBagIndexById(id);
          if (index < 0) {
            return prevFileBags;
          }
          prevFileBags[index] = {...prevFileBags[index], ...data};
          const updatedFileBag = prevFileBags[index];
          const nextFileBags = [...prevFileBags];
          resolve({updatedFileBag, fileBags: nextFileBags});
          return nextFileBags;
        });
      });
      return {updatedFileBag, fileBags};
    },
    [setFileBags, findFileBagIndexById],
  );

  const uploadFile = useCallback(
    async (file, id) => {
      const defaultConfig = {
        onUploadProgress: ({total, loaded}: ProgressEvent) => {
          const progress = Math.round((loaded / total) * 100);
          const status: FileBag['status'] = 'uploading';
          updateFileBag(id, {progress, status});
        },
        data: file,
      };
      try {
        const {url, method, headers, data, meta}: any = await getUploadParams(
          file,
        );

        const res = await axios.request({
          ...defaultConfig,
          ...{url, method, headers, data},
        });

        const status: FileBag['status'] = 'uploaded';
        const {updatedFileBag, fileBags} = await updateFileBag(id, {
          responseData: res.data,
          status,
          httpStatus: res.status,
          meta,
        });
        if (updatedFileBag && onUploaded) {
          const uploadedFileBags = fileBags.filter(
            ({status}) => status === 'uploaded',
          );
          onUploaded(updatedFileBag, uploadedFileBags);
        }
      } catch (e) {
        const status: FileBag['status'] = 'failed';
        const {updatedFileBag, fileBags} = await updateFileBag(id, {
          status,
          httpStatus: e && e.response && e.response.status,
          responseData: e && e.response && e.response.data,
        });

        if (updatedFileBag && onFailed) {
          const failedFileBags = fileBags.filter(
            ({status}) => status === 'failed',
          );
          onFailed(updatedFileBag, failedFileBags);
        }
      }
    },
    [getUploadParams, onUploaded, updateFileBag],
  );

  const retryUpload = useCallback(
    async (id) => {
      const {updatedFileBag} = await updateFileBag(id, {
        httpStatus: null,
        responseData: null,
      });
      if (updatedFileBag) {
        uploadFile(updatedFileBag.file, id);
      }
    },
    [fileBags, findFileBagIndexById, uploadFile],
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      // return if null or undefined
      if (!acceptedFiles) {
        return;
      }
      acceptedFiles = [...acceptedFiles]; // converts to array if FileList
      const arr: FileBag[] = acceptedFiles.map((file: File) => {
        const timeStamp = new Date().getTime();
        return {
          id: timeStamp + file.name,
          file,
          progress: 0,
          status: 'uploading',
          formattedSize: formatFileSize(file.size),
        } as FileBag;
      });
      setFileBags([...fileBags, ...arr]);
      setNewFileBags(arr);
    },
    [fileBags, setFileBags],
  );

  useEffect(() => {
    // trigger upload whenever a new file is added
    newFileBags.map(({file, id}) => uploadFile(file, id));
    // adding uploadFile to list of dependencies will cause infinity loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFileBags]);

  const removeFileBag = useCallback(
    (id) => {
      const index = findFileBagIndexById(id);
      fileBags.splice(index, 1);
      setFileBags([...fileBags]);
    },
    [fileBags, setFileBags, findFileBagIndexById],
  );

  const clearFileBags = useCallback(() => {
    setFileBags([]);
  }, [setFileBags]);

  return {
    onDrop,
    fileBags,
    retryUpload,
    removeFileBag,
    clearFileBags,
  };
}

export * from './file-bag';
export * from './utils';
