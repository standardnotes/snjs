"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTag = void 0;
/* istanbul ignore file */
var ErrorTag;
(function (ErrorTag) {
    ErrorTag["MfaInvalid"] = "mfa-invalid";
    ErrorTag["MfaRequired"] = "mfa-required";
    ErrorTag["RefreshTokenInvalid"] = "invalid-refresh-token";
    ErrorTag["RefreshTokenExpired"] = "expired-refresh-token";
    ErrorTag["AccessTokenExpired"] = "expired-access-token";
    ErrorTag["ParametersInvalid"] = "invalid-parameters";
    ErrorTag["RevokedSession"] = "revoked-session";
    ErrorTag["AuthInvalid"] = "invalid-auth";
})(ErrorTag = exports.ErrorTag || (exports.ErrorTag = {}));
