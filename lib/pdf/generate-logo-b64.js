const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '../../assets/images/favicon.png');
const outPath = path.join(__dirname, 'logo.ts');

const data = fs.readFileSync(imgPath);
const b64 = 'data:image/png;base64,' + data.toString('base64');

const content = `/* Logo favicon desde assets/images/favicon.png convertido a base64 */
export const LOGO_BASE64 =
  "${b64}";
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('✅ logo.ts actualizado con favicon.png');
