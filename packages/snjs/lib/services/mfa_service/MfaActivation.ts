import * as messages from '../api/messages';
import jsSHA from 'jssha';

function randomBase32(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function dec2hex(n: number) {
  return (n < 15.5 ? '0' : '') + Math.round(n).toString(16);
}

function hex2dec(s: string) {
  return parseInt(s, 16);
}

function base32tohex(base32: string) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    bits += leftpad(val.toString(2), 5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }
  return hex;
}

function leftpad(str: string, len: number, pad: string) {
  if (len + 1 >= str.length) {
    str = Array(len + 1 - str.length).join(pad) + str;
  }
  return str;
}

export const newSecret = () => randomBase32(16);

const qrCodeUrlFromSecret = (secret: string) =>
  `otpauth://totp/2FA?secret=${secret}&issuer=Standard%20Notes`;

export class MfaActivation {
  constructor(
    private readonly _secret: string,
    private readonly saveMfa: (secret: string) => Promise<void>
  ) {}

  getQrCodeUrl() {
    return qrCodeUrlFromSecret(this._secret);
  }

  getSecret() {
    return this._secret;
  }

  async getOtp() {
    const secret = base32tohex(this._secret);
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');

    const shaObj = new jsSHA('SHA-1', 'HEX');
    shaObj.setHMACKey(secret, 'HEX');
    shaObj.update(time);
    const hmac = shaObj.getHMAC('HEX');

    const offset = hex2dec(hmac.substring(hmac.length - 1));
    const otp =
      (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
    return otp.substr(otp.length - 6, 6);
  }

  async enableMfa(secret: string, authCode: string) {
    if (secret !== this._secret || authCode !== (await this.getOtp())) {
      throw new Error(
        messages.KeyRecoveryStrings.KeyRecoveryLoginFlowInvalidPassword
      );
    }
    return this.saveMfa(secret);
  }
}
