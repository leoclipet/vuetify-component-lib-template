import axios from 'axios';
import qs from 'qs';
import _isArray from 'lodash/isArray';

let baseURL = '';
switch (process.env.NODE_ENV) {
  case 'development': {
    baseURL = 'https://localhost:44359/api/v1';
    break;
  }
  case 'production': {
    baseURL = 'webapi/api/v1';
    break;
  }
  case 'docker': {
    const port = process.env.VUE_APP_WebAPI_PORT;
    const path = process.env.VUE_APP_WebAPI_Path;
    const version = process.env.VUE_APP_WebAPI_Version;

    const url = new URL(window.location.origin);
    url.port = port;
    baseURL = `${url.origin.toString()}/${path}/${version}`;
    break;
  }
  default: baseURL = 'webapi/api/v1';
}

const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params: any) => {
    Object.keys(params).forEach((key) => {
      if (_isArray(params[key]) && !params[key].length) {
        // eslint-disable-next-line no-param-reassign
        delete params[key];
      }
    });
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
});

export default http;
