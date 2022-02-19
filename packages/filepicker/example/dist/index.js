var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SNApplication, Environment, Platform, SNLog, Runtime, ApplicationOptionsDefaults, } from '../../../snjs';
import WebDeviceInterface from './web_device_interface';
import { SNWebCrypto } from '../../../sncrypto-web';
import { ClassicFileApi } from './classic_file_api';
import { FileSystemApi } from './file_system_api';
SNLog.onLog = console.log;
SNLog.onError = console.error;
console.log('Clearing localStorage...');
localStorage.clear();
/**
 * Important:
 * If reusing e2e docker servers, you must edit docker/auth.env ACCESS_TOKEN_AGE
 * and REFRESH_TOKEN_AGE and increase their ttl.
 */
const host = 'http://localhost:3123';
const filesHost = 'http://localhost:3125';
const mocksHost = 'http://localhost:3124';
const application = new SNApplication(Environment.Web, Platform.MacWeb, new WebDeviceInterface(), new SNWebCrypto(), {
    confirm: () => __awaiter(void 0, void 0, void 0, function* () { return true; }),
    alert: () => __awaiter(void 0, void 0, void 0, function* () {
        alert();
    }),
    blockingDialog: () => () => {
        confirm();
    },
}, `${Math.random()}`, [], host, filesHost, '1.0.0', undefined, Runtime.Dev, Object.assign(Object.assign({}, ApplicationOptionsDefaults), { filesChunkSize: 1000000 }));
console.log('Created application', application);
export function publishMockedEvent(eventType, eventPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${mocksHost}/events`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventType,
                eventPayload,
            }),
        });
    });
}
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Preparing for launch...');
    yield application.prepareForLaunch({
        receiveChallenge: () => {
            console.warn('Ignoring challenge');
        },
    });
    yield application.launch();
    console.log('Application launched...');
    const email = String(Math.random());
    const password = String(Math.random());
    console.log('Registering account...');
    yield application.register(email, password);
    console.log(`Registered account ${email}/${password}. Be sure to edit docker/auth.env to increase session TTL.`);
    console.log('Creating mock subscription...');
    yield publishMockedEvent('SUBSCRIPTION_PURCHASED', {
        userEmail: email,
        subscriptionId: 1,
        subscriptionName: 'PLUS_PLAN',
        subscriptionExpiresAt: (new Date().getTime() + 3600000) * 1000,
        timestamp: Date.now(),
        offline: false,
    });
    console.log('Successfully created mock subscription...');
    new ClassicFileApi(application);
    new FileSystemApi(application);
});
void run();
