export default {
  env: 'development',
  MONGOOSE_DEBUG: true,
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  db: process.env.DEV_DB || 'mongodb://localhost/seasonboy',
  port: 4040,
  cloudinary_cloud_name: 'vamche',
  cloudinary_api_key: '317823213182943',
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
};
