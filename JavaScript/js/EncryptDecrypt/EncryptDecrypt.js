import {MasterWorker} from 'SharedHelper/Prototype/Helper/MasterWorker.js';

// https://github.com/okandavut/hencrypt/blob/master/index.js
export class EncryptDecrypt extends MasterWorker {
    constructor () {
        super()

        this.create(this.encrypt);
        this.encrypt = (text, salt) => {
            let encryptResolve = null;
            const encryptPromise = new Promise(resolve => {
                encryptResolve = resolve;
            });
            this.run([text, salt], this.workers[0], encryptedText => encryptResolve(encryptedText));
            return encryptPromise;
        }
        this.create(this.decrypt);
        this.decrypt = (text, salt) => {
            let decryptResolve = null;
            const decryptPromise = new Promise(resolve => {
                decryptResolve = resolve;
            });
            this.run([text, salt], this.workers[1], decryptedText => decryptResolve(decryptedText));
            return decryptPromise;
        }
    }
    encrypt (text, salt) {
        const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
        const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
        return text
            .split("")
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join("");
    }
    decrypt (text, salt) {
        const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
        const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
        return text
            .match(/.{1,2}/g)
            .map((hex) => parseInt(hex, 16))
            .map(applySaltToChar)
            .map((charCode) => String.fromCharCode(charCode))
            .join("");
    }
}