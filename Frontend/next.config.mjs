import os from 'os';

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
        ips.push(`${iface.address}:3000`);
      }
    }
  }
  return ips;
}

const localIPs = getLocalIPs();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost',
    '127.0.0.1',
    ...localIPs
  ],
};


export default nextConfig;
