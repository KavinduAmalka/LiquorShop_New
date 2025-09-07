import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import selfsigned from 'selfsigned';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create self-signed certificate for development
const certDir = path.join(__dirname, 'certs');

// Ensure certs directory exists
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

try {
  console.log('🔐 Generating SSL certificates for development...');
  
  // Generate self-signed certificate
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'LiquorShop Dev' },
    { name: 'organizationalUnitName', value: 'Development' }
  ];

  const opts = {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: 'localhost'
          },
          {
            type: 7, // IP
            ip: '127.0.0.1'
          }
        ]
      }
    ]
  };

  const pems = selfsigned.generate(attrs, opts);
  
  // Write certificate files
  fs.writeFileSync(path.join(certDir, 'localhost-key.pem'), pems.private);
  fs.writeFileSync(path.join(certDir, 'localhost.pem'), pems.cert);
  
  console.log('✅ SSL certificates generated successfully!');
  console.log('📁 Private key:', path.join(certDir, 'localhost-key.pem'));
  console.log('📁 Certificate:', path.join(certDir, 'localhost.pem'));
  console.log('🚀 You can now start the server with HTTPS enabled!');
  
} catch (error) {
  console.error('❌ Error generating SSL certificates:', error.message);
  process.exit(1);
}
