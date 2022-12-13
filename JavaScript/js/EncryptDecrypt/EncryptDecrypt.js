import {MasterWorker} from 'SharedHelper/Prototype/Helper/MasterWorker.js';

// https://github.com/okandavut/hencrypt/blob/master/index.js
export class EncryptDecrypt extends MasterWorker {
    constructor () {
        super()

        this.encryptedIndicator = 'SST_Encrypted:'
        this.hintEndIndicator = ':SST_Hint'

        this.create(this.encrypt);
        this.encrypt = (text, salt) => {
            let encryptResolve = null;
            const encryptPromise = new Promise(resolve => {
                encryptResolve = resolve;
            });
            if (!salt) salt = window.prompt('Enter a password or passphrase in case you want to encrypt the html/text!?');
            if (salt) {
                let hint = window.prompt('Enter a hint or question in case you want to give a clue!?') || '';
                if (hint) hint = hint + this.hintEndIndicator;
                this.run([text, salt], this.workers[0], encryptedText => encryptResolve({text: this.encryptedIndicator + hint + encryptedText, encrypted: true}));
            } else {
                encryptResolve({text, encrypted: false});
            }
            return encryptPromise;
        }
        this.create(this.decrypt);
        this.decrypt = (text, salt, failedFunc = null) => {
            let decryptResolve = null;
            const decryptPromise = new Promise(resolve => {
                decryptResolve = resolve;
            });
            if (this.isEncrypted(text)) {
                if (!salt) {
                    let hint = text.match(new RegExp(this.encryptedIndicator + '(.*)' + this.hintEndIndicator))
                    hint = Array.isArray(hint) ? hint[1] || '' : ''
                    salt = window.prompt('Enter a password or passphrase to decrypt this Peer Web Site\'s html/text!' + (hint ? `\n\nHint: ${hint}` : ''));
                    if (hint) text = text.replace(new RegExp(this.encryptedIndicator + '(.*)' + this.hintEndIndicator), '')
                }
                if (salt) {
                    this.run([text.replace(this.encryptedIndicator, ''), salt], this.workers[1], decryptedText => decryptResolve({text: decryptedText, decrypted: true}));
                } else if (typeof failedFunc === 'function'){
                    const funcName = 'SSTdecryptFunc';
                    window[funcName] = event => {
                        event.preventDefault();
                        event.stopPropagation();
                        window[funcName] = event => {};
                        this.decrypt(text).then(result => {
                            const {text, decrypted} = result;
                            failedFunc(text);
                        });
                    };
                    decryptResolve({text: `<div class="SSTdecrypt" onclick="${funcName}(event)"><span class="glyphicon glyphicon-lock"></span><a onclick="${funcName}(event)">Click and fill in the prompt with the password or passphrase!<br>${text}</a></div>`, decrypted: 'failed'});
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
    isEncrypted (text) {
        return text.includes(this.encryptedIndicator);
    }
}