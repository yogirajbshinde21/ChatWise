// Cloudinary is not a database, it's just a bucket (a storage service) for our images and videos.

import { v2 as cloudinary } from 'cloudinary';

import {config} from 'dotenv';

config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,

});

export default cloudinary;