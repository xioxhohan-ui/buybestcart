import crypto from 'crypto';

interface SigV4Params {
  accessKey: string;
  secretKey: string;
  host: string;
  region: string;
  service: string;
  target: string;
  payload: string;
  date?: Date;
}

interface SignedHeaders {
  'Content-Type': string;
  'Content-Encoding': string;
  'x-amz-target': string;
  'x-amz-date': string;
  'Host': string;
  'Authorization': string;
}

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function hash(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Creates AWS Signature Version 4 HMAC-SHA256 headers for Amazon PA-API v5
 */
export function signAmazonPaApiRequest(params: SigV4Params): SignedHeaders {
  const now = params.date || new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const contentType = 'application/json; charset=utf-8';
  const contentEncoding = 'amz-1.0';

  // 1. Canonical Headers
  const canonicalHeaders =
    `content-encoding:${contentEncoding}\n` +
    `content-type:${contentType}\n` +
    `host:${params.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${params.target}\n`;

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const payloadHash = hash(params.payload);

  // 2. Canonical Request
  const canonicalRequest =
    `POST\n` +
    `/paapi5/getitems\n` +
    `\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  // 3. String to Sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${params.region}/${params.service}/aws4_request`;
  const stringToSign =
    `${algorithm}\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    `${hash(canonicalRequest)}`;

  // 4. Signing Key Calculation
  const kDate = hmac(`AWS4${params.secretKey}`, dateStamp);
  const kRegion = hmac(kDate, params.region);
  const kService = hmac(kRegion, params.service);
  const kSigning = hmac(kService, 'aws4_request');

  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  // 5. Authorization Header
  const authorizationHeader = `${algorithm} Credential=${params.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Content-Type': contentType,
    'Content-Encoding': contentEncoding,
    'x-amz-target': params.target,
    'x-amz-date': amzDate,
    'Host': params.host,
    'Authorization': authorizationHeader,
  };
}
