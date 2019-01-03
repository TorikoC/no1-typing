const devConfig = {
  server: 'http://localhost:3000',
  apiServer: 'http://localhost:3000',
};

const prodConfig = {
  server: 'https://35.234.15.82',
  apiServer: 'https://35.234.15.82',
};

export default (process.env.NODE_ENV === 'production' ? prodConfig : devConfig);
