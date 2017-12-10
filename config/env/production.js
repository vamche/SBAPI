export default {
  env: 'production',
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  db: process.env.PROD_DB,
  port: 4040,
  cloudinary_cloud_name: 'vamche',
  cloudinary_api_key: '317823213182943',
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
};
