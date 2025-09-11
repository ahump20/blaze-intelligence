
/**
 * Blaze Intelligence Encryption Utilities
 * Enterprise-grade encryption for sensitive data
 */

const crypto = require('crypto');
const { promisify } = require('util');

class BlazeEncryption {
  constructor(masterKey) {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
    this.tagLength = 16; // 128 bits
    this.masterKey = masterKey || process.env.BLAZE_MASTER_KEY;
    
    if (!this.masterKey) {
      throw new Error('Master encryption key required');
    }
  }

  // Encrypt sensitive data
  encrypt(plaintext, additionalData = '') {
    const key = crypto.scryptSync(this.masterKey, 'salt', this.keyLength);
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from(additionalData));
    
    let ciphertext = cipher.update(plaintext, 'utf8');
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    
    // Combine IV + ciphertext + tag for storage
    const encrypted = Buffer.concat([iv, ciphertext, tag]);
    
    return {
      encrypted: encrypted.toString('base64'),
      algorithm: this.algorithm,
      keyId: this.getKeyId()
    };
  }

  // Decrypt sensitive data
  decrypt(encryptedData, additionalData = '') {
    const buffer = Buffer.from(encryptedData.encrypted, 'base64');
    
    const iv = buffer.slice(0, this.ivLength);
    const tag = buffer.slice(-this.tagLength);
    const ciphertext = buffer.slice(this.ivLength, -this.tagLength);
    
    const key = crypto.scryptSync(this.masterKey, 'salt', this.keyLength);
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from(additionalData));
    decipher.setAuthTag(tag);
    
    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);
    
    return plaintext.toString('utf8');
  }

  // Encrypt Cardinals analytics data
  encryptCardinalsData(analyticsData) {
    const sensitiveFields = ['readiness', 'performance', 'insights'];
    const encrypted = { ...analyticsData };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(
          JSON.stringify(encrypted[field]),
          'cardinals-analytics'
        );
      }
    });
    
    encrypted._encrypted = true;
    encrypted._timestamp = Date.now();
    
    return encrypted;
  }

  // Encrypt NIL calculation data (COPPA compliance)
  encryptNILData(nilData) {
    // Special handling for youth athlete data (COPPA)
    if (nilData.age && nilData.age < 18) {
      nilData._coppaProtected = true;
      nilData._parentalConsent = nilData.parentalConsent || false;
    }
    
    const sensitiveFields = ['socialMedia', 'stats', 'marketReach', 'nilValue'];
    const encrypted = { ...nilData };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(
          JSON.stringify(encrypted[field]),
          'nil-calculation'
        );
      }
    });
    
    return encrypted;
  }

  // Hash for integrity verification
  generateIntegrityHash(data) {
    return crypto.createHmac('sha256', this.masterKey)
                 .update(JSON.stringify(data))
                 .digest('hex');
  }

  // Verify data integrity
  verifyIntegrity(data, hash) {
    const computedHash = this.generateIntegrityHash(data);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  }

  // Get key identifier for rotation tracking
  getKeyId() {
    return crypto.createHash('sha256')
                 .update(this.masterKey)
                 .digest('hex')
                 .substring(0, 8);
  }
}

module.exports = BlazeEncryption;
