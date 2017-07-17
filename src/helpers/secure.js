import crypto from 'crypto';

const secret = 'secret';

export default value => crypto.createHmac('sha256', secret)
  .update(value)
  .digest('hex');
