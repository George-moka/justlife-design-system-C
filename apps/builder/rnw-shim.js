import { Image as _RNImg } from 'react-native';
if (_RNImg && typeof _RNImg.resolveAssetSource !== 'function') {
  _RNImg.resolveAssetSource = (s) =>
    typeof s === 'string' ? { uri: s } : s && s.uri ? { uri: s.uri } : { uri: '' };
}
