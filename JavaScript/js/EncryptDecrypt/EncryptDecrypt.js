import {MasterWorker} from 'SharedHelper/Prototype/Helper/MasterWorker.js';

// https://github.com/okandavut/hencrypt/blob/master/index.js
export class EncryptDecrypt extends MasterWorker {
    constructor () {
        super()

        this.encryptedIndicator = 'SST_Encrypted:'

        this.create(this.encrypt);
        this.encrypt = (text, salt) => {
            let encryptResolve = null;
            const encryptPromise = new Promise(resolve => {
                encryptResolve = resolve;
            });
            if (!salt) salt = window.prompt('Enter a password/passphrase in case you want to encrypt the html/text!');
            if (salt) {
                this.run([text, salt], this.workers[0], encryptedText => encryptResolve({text: this.encryptedIndicator + encryptedText, encrypted: true}));
            } else {
                encryptResolve({text, encrypted: false});
            }
            return encryptPromise;
        }
        this.create(this.decrypt);
        this.decrypt = (text, salt) => {
            let decryptResolve = null;
            const decryptPromise = new Promise(resolve => {
                decryptResolve = resolve;
            });
            if (text.includes(this.encryptedIndicator)) {
                if (!salt) salt = window.prompt('Enter a password/passphrase to decrypt this peerweb sites html/text!');
                if (salt) {
                    this.run([text.replace(this.encryptedIndicator, ''), salt], this.workers[1], decryptedText => decryptResolve({text: decryptedText, decrypted: true}));
                } else {
                    decryptResolve({text, decrypted: 'failed'});
                }
            } else {
                decryptResolve({text, decrypted: false});
            }
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