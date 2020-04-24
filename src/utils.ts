export const formatFileSize = (sizeInBytes: number) => {
  const thresh = 1000;
  if (Math.abs(sizeInBytes) < thresh) {
    return sizeInBytes + ' B';
  }
  const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  do {
    sizeInBytes /= thresh;
    ++u;
  } while (Math.abs(sizeInBytes) >= thresh && u < units.length - 1);
  return sizeInBytes.toFixed(1) + ' ' + units[u];
};
