const fs = require('fs');

if (!fs.existsSync('env.ts')) {
  fs.copyFile(
    'example.env.ts',
    'env.ts',
    err => {
      if (err) {
        console.log(err);
      }
    },
  );
}
