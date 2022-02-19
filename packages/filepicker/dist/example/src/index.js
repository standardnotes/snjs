"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.publishMockedEvent = void 0;
var snjs_1 = require("../../../snjs");
var web_device_interface_1 = __importDefault(require("./web_device_interface"));
var sncrypto_web_1 = require("../../../sncrypto-web");
var classic_file_api_1 = require("./classic_file_api");
var file_system_api_1 = require("./file_system_api");
snjs_1.SNLog.onLog = console.log;
snjs_1.SNLog.onError = console.error;
console.log('Clearing localStorage...');
localStorage.clear();
/**
 * Important:
 * If reusing e2e docker servers, you must edit docker/auth.env ACCESS_TOKEN_AGE
 * and REFRESH_TOKEN_AGE and increase their ttl.
 */
var host = 'http://localhost:3123';
var filesHost = 'http://localhost:3125';
var mocksHost = 'http://localhost:3124';
var application = new snjs_1.SNApplication(snjs_1.Environment.Web, snjs_1.Platform.MacWeb, new web_device_interface_1["default"](), new sncrypto_web_1.SNWebCrypto(), {
    confirm: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, true];
    }); }); },
    alert: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            alert();
            return [2 /*return*/];
        });
    }); },
    blockingDialog: function () { return function () {
        confirm();
    }; }
}, "" + Math.random(), [], host, filesHost, '1.0.0', undefined, snjs_1.Runtime.Dev, __assign(__assign({}, snjs_1.ApplicationOptionsDefaults), { filesChunkSize: 1000000 }));
console.log('Created application', application);
function publishMockedEvent(eventType, eventPayload) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(mocksHost + "/events", {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            eventType: eventType,
                            eventPayload: eventPayload
                        })
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.publishMockedEvent = publishMockedEvent;
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var email, password;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Preparing for launch...');
                return [4 /*yield*/, application.prepareForLaunch({
                        receiveChallenge: function () {
                            console.warn('Ignoring challenge');
                        }
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, application.launch()];
            case 2:
                _a.sent();
                console.log('Application launched...');
                email = String(Math.random());
                password = String(Math.random());
                console.log('Registering account...');
                return [4 /*yield*/, application.register(email, password)];
            case 3:
                _a.sent();
                console.log("Registered account " + email + "/" + password + ". Be sure to edit docker/auth.env to increase session TTL.");
                console.log('Creating mock subscription...');
                return [4 /*yield*/, publishMockedEvent('SUBSCRIPTION_PURCHASED', {
                        userEmail: email,
                        subscriptionId: 1,
                        subscriptionName: 'PLUS_PLAN',
                        subscriptionExpiresAt: (new Date().getTime() + 3600000) * 1000,
                        timestamp: Date.now(),
                        offline: false
                    })];
            case 4:
                _a.sent();
                console.log('Successfully created mock subscription...');
                new classic_file_api_1.ClassicFileApi(application);
                new file_system_api_1.FileSystemApi(application);
                return [2 /*return*/];
        }
    });
}); };
void run();
