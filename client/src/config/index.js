const devConfig = {
  server: 'http://localhost:3000',
  apiServer: 'http://localhost:3000',
};

const prodConfig = {
  server: 'http://localhost:3000',
  apiServer: 'http://localhost:3000',
};
// const prodConfig = {
//   server: 'http://35.241.200.20:3000',
//   apiServer: 'http://35.241.200.20:3000',
// };

export default (process.env.NODE_ENV === 'production' ? prodConfig : devConfig);
