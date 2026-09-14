const UPLOAD_PATH = '/upload/';
const PRODUCT_UPLOAD_PATH = '/upload/product/';

function appendMobileSuffix(source, requiredPath) {
  const url = String(source ?? '').trim();

  if (!url) {
    return '';
  }

  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const suffixIndexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  const suffixIndex = suffixIndexes.length ? Math.min(...suffixIndexes) : url.length;
  const path = url.slice(0, suffixIndex);
  const suffix = url.slice(suffixIndex);

  if (!path.toLowerCase().includes(requiredPath)) {
    return url;
  }

  const slashIndex = path.lastIndexOf('/');
  const extensionIndex = path.lastIndexOf('.');

  if (extensionIndex <= slashIndex) {
    return url;
  }

  const filenameWithoutExtension = path.slice(0, extensionIndex);

  if (filenameWithoutExtension.toLowerCase().endsWith('-mb')) {
    return url;
  }

  return `${filenameWithoutExtension}-mb${path.slice(extensionIndex)}${suffix}`;
}

export function toMobileImageUrl(source = '') {
  return appendMobileSuffix(source, UPLOAD_PATH);
}

export function toProductThumbnailUrl(source = '') {
  return appendMobileSuffix(source, PRODUCT_UPLOAD_PATH);
}
