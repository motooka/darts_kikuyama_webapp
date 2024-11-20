import fs from 'fs';

const now = new Date();
const year = now.getUTCFullYear();
const month = String(now.getUTCMonth() + 1).padStart(2, '0');
const day = String(now.getUTCDate()).padStart(2, '0');
const hour = String(now.getUTCHours()).padStart(2, '0');
const minute = String(now.getUTCMinutes()).padStart(2, '0');

const dataObj = {
    built: `${year}${month}${day}-${hour}${minute}`,
};
const dataStr = JSON.stringify(dataObj);

const tsData = `export const buildInfo = ${dataStr};`;
fs.writeFileSync('./src/buildInfo.ts', tsData);
