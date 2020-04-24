export interface FileBag {
  id: string;
  file: File;
  uploadUrl: string;
  progress: number;
  formattedSize: string;
  status: 'uploading' | 'uploaded' | 'failed';
  httpStatus: number;
  message: string;
  responseData: any;
  meta?: {[key: string]: any}; // any extra data forwarded from getUploadParams()
}
