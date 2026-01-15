const fs = require('fs');
const files = [
  'src/app/thanh-toan/page.js',
  'src/app/supplier/page.js',
  'src/app/shop/[slug]/page.js',
  'src/app/don-hang/page.js',
  'src/app/bai-viet/[slug]/page.js',
  'src/app/admin/products/page.js',
  'src/app/admin/page.js'
];
files.forEach(f => {
  try {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log('Deleted: ' + f);
    }
  } catch (e) {
    console.error('Error deleting ' + f + ': ' + e.message);
  }
});
