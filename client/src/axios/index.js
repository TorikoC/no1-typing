import Axios from 'axios';
import config from '../config';

let axios = Axios.create({
  baseURL: config.apiServer,
});

axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response.data;
  },
  function(error) {
    // TODO:
    // add global error handler here
    window.alert(error.response.data.error);
    return Promise.reject(error.response.data);
  },
);

export default axios;
