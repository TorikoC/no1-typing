const devConfig = {
  server: 'http://localhost:3000',
  apiServer: 'http://localhost:3000/api',
};
const prodConfig = {
  server: 'http://35.241.200.20',
  apiServer: 'http://35.241.200.20/api',
};

export default (process.env.NODE_ENV === 'production' ? prodConfig : devConfig);
