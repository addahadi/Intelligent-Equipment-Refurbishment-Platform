import cloudinary from '../config/cloudinary.js';

// Stream a single in-memory buffer to Cloudinary, resolving to its secure URL.
function uploadOne(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url)),
    );
    stream.end(buffer);
  });
}

export async function uploadMany(files, folder) {
  return Promise.all(files.map((f) => uploadOne(f.buffer, folder)));
}
