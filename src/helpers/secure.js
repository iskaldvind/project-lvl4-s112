import crypto from 'crypto';

const secret = 'secret';

export const encrypt = value => crypto.createHmac('sha256', secret)
  .update(value)
  .digest('hex');