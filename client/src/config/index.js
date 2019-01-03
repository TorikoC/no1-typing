const devConfig = {
  server: 'http://localhost:3000',
  apiServer: 'http://localhost:3000',
};

const prodConfig = {
  server: 'https://dazi.online',
  apiServer: 'https://dazi.online',
};

export default (process.env.NODE_ENV === 'production' ? prodConfig : devConfig);
