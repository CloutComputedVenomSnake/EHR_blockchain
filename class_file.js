"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chain = exports.Block = exports.Transaction = exports.Doctor = exports.visitInfo = exports.personalInfo = exports.bloodType = exports.gender = void 0;
const crypto = __importStar(require("crypto"));
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');
const fs_1 = __importDefault(require("fs"));
var gender;
(function (gender) {
    gender["male"] = "Male";
    gender["female"] = "Female";
})(gender = exports.gender || (exports.gender = {}));
var bloodType;
(function (bloodType) {
    bloodType["O"] = "O";
    bloodType["A"] = "A";
    bloodType["X"] = "X";
})(bloodType = exports.bloodType || (exports.bloodType = {}));
class personalInfo {
    constructor(name, age, gender, bloodType, weight, height, bloodPressure, pulse, oxygen) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.bloodType = bloodType;
        this.weight = weight;
        this.height = height;
        this.bloodPressure = bloodPressure;
        this.pulse = pulse;
        this.oxygen = oxygen;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.personalInfo = personalInfo;
class visitInfo {
    constructor(patientInfo, dateOfVisit, doctorName, reasonOfVisit, prescription) {
        this.patientInfo = patientInfo;
        this.dateOfVisit = dateOfVisit;
        this.doctorName = doctorName;
        this.reasonOfVisit = reasonOfVisit;
        this.prescription = prescription;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.visitInfo = visitInfo;
class Doctor {
    constructor(name, age, password = "password") {
        this.name = name;
        this.age = age;
        this.password = password;
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    toString() {
        return JSON.stringify(this);
    }
    sign(password, transaction) {
        var signature = Buffer.alloc(0);
        if (password === this.password) {
            console.log("transaction signed succesfully");
            const sign = crypto.createSign('SHA256');
            sign.update(transaction.toString()).end();
            signature = sign.sign(this.privateKey);
            return signature.toString("hex");
        }
        else {
            console.log("wrong password");
            return signature.toString("hex");
        }
    }
    verify_signiture(sign, transaction) {
        //const signature_buffer = Buffer.from(signature, "utf-8");
        const signature = Buffer.from(sign, "hex");
        const doctor_PK = this.publicKey;
        const doctor_name = this.name;
        const verify = crypto.createVerify('SHA256');
        verify.update(transaction);
        const isValid = verify.verify(doctor_PK, signature);
        if (signature.length === 0) {
            console.log("this is not a valid signature");
        }
        else if (isValid) {
            console.log(`doctor ${doctor_name} signed this visit`);
        }
        else {
            console.log("this doctor did not sign this message");
        }
    }
}
exports.Doctor = Doctor;
class Transaction {
    constructor(transaction, signiture) {
        this.transaction = transaction;
        this.signiture = signiture;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Transaction = Transaction;
class Block {
    constructor(prevHash, transaction) {
        this.prevHash = prevHash;
        this.transaction = transaction;
    }
    toString() {
        return JSON.stringify(this);
    }
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
    get lastHash() {
        return this.prevHash;
    }
    getTransaction() {
        return this.transaction;
    }
    encryptData(blockchain_key, blockchain_iv) {
        console.log(this.transaction);
        const patient_cipher = createCipheriv('aes256', chain.blockchain_key, chain.blockchain_iv);
        var encrypted_info = patient_cipher.update(this.transaction, 'utf8', 'hex') + patient_cipher.final('hex');
        this.transaction = encrypted_info;
    }
    decryptData(blockchain_key, blockchain_iv) {
        const decipher_function = createDecipheriv('aes256', chain.blockchain_key, chain.blockchain_iv);
        var decrypted_data = decipher_function.update(this.transaction, 'hex', 'utf8') + decipher_function.final('utf8');
        this.transaction = decrypted_data;
    }
}
exports.Block = Block;
let unSerializeChain = function () {
    try {
        let bufferedData = fs_1.default.readFileSync('./chain.json');
        let dataString = bufferedData.toString();
        let chainArray = JSON.parse(dataString);
        return chainArray;
    }
    catch (error) {
        return [];
    }
};
class chain {
    constructor() {
        this.saved_key = chain.blockchain_key.toString();
        this.saved_iv = chain.blockchain_iv.toString();
        this.serializeChain = function (currChain) {
            currChain.saved_key = chain.blockchain_key.toString('hex');
            currChain.saved_iv = chain.blockchain_iv.toString('hex');
            fs_1.default.writeFileSync('./chain.json', JSON.stringify(currChain));
        };
        let fileData = unSerializeChain();
        console.log("Ran HERE");
        if (Object.keys(fileData).length === 0) {
            var block = new Block("0000", "Genesis Block");
            block.encryptData(chain.blockchain_key, chain.blockchain_iv);
            this.blockchain = [block];
            this.saved_key = chain.blockchain_key.toString('hex');
            this.saved_iv = chain.blockchain_iv.toString('hex');
            this.serializeChain(this);
        }
        else {
            chain.instance = fileData;
            //Object.assign(chain.instance, temp);
            // var buf = new Buffer.from(chain.instance.saved_key.toString())
            var temp = chain.instance.blockchain;
            this.blockchain = [];
            for (var i = 0; i < chain.instance.blockchain.length; i++) {
                this.blockchain.push(temp[i]);
            }
            chain.blockchain_key = Buffer.from(chain.instance.saved_key, "hex");
            chain.blockchain_iv = Buffer.from(chain.instance.saved_iv, "hex");
            console.log(chain.blockchain_key);
        }
    }
    toString() {
        return JSON.stringify(this);
    }
    get lastBlock() {
        const lastblock = new Block();
        let temp = this.blockchain[this.blockchain.length - 1];
        Object.assign(lastblock, temp);
        return lastblock;
    }
    getBlock(pos) {
        const currBlock = new Block();
        let temp = this.blockchain[pos];
        Object.assign(currBlock, temp);
        // currBlock.decryptData(password, chain.blockchain_key, chain.blockchain_iv, chain.decipher_function)
        currBlock.decryptData(chain.blockchain_key, chain.blockchain_iv);
        console.log(currBlock);
        return currBlock;
    }
    addBlock(Block) {
        // Block.encryptData(password, chain.blockchain_key, chain.blockchain_iv, chain.patient_cipher)
        Block.encryptData(chain.blockchain_key, chain.blockchain_iv);
        this.blockchain.push(Block);
        this.serializeChain(this);
    }
    createBlock(transaction, doctor) {
        const lastblock = chain.instance.lastBlock;
        const signature = doctor.sign(doctor.password, transaction);
        if (signature.length === 0) {
            console.log("Creation Failed ::: Wrong Password Entered");
        }
        else {
            const t = new Transaction(transaction, signature);
            const block = new Block(lastblock.hash, t.toString());
            this.addBlock(block);
        }
        // getBlock(pos:number, password:string){
        //   const currBlock:Block = this.blockchain[pos]
        //   // currBlock.decryptData(password, chain.blockchain_key, chain.blockchain_iv, chain.decipher_function)
        //   currBlock.decryptData(chain.blockchain_key, chain.blockchain_iv)
        //   return currBlock
        // }
        // addBlock(Block:Block, password:string){
        //   // Block.encryptData(password, chain.blockchain_key, chain.blockchain_iv, chain.patient_cipher)
        //   Block.encryptData(password, chain.blockchain_key, chain.blockchain_iv)
        //   this.blockchain.push(Block);
        // }
        // createBlock(transaction:string, password:string, doctor:Doctor){
        //   const lastblock = chain.instance.lastBlock
        //   const signature = doctor.sign(password, transaction)
        //   if(signature.length === 0){
        //     console.log("Creation Failed ::: Wrong Password Entered")
        //   }
        //   else{
        //     const t = new Transaction(transaction, signature)
        //     const block = new Block(lastblock.hash, t.toString())
        //     this.addBlock(block, password)
        //   }
    }
}
exports.chain = chain;
chain.blockchain_key = randomBytes(32);
chain.blockchain_iv = randomBytes(16);
chain.instance = new chain();
