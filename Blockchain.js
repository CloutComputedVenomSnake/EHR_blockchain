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
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchain = exports.Block = exports.Transaction = exports.Doctor = exports.visitInfo = exports.personalInfo = exports.bloodType = exports.gender = void 0;
const crypto = __importStar(require("crypto"));
const readline = __importStar(require("readline"));
const process_1 = require("process");
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');
//import { text } from 'stream/consumers';
var gender;
(function (gender) {
    gender["male"] = "Male";
    gender["female"] = "Female";
})(gender = exports.gender || (exports.gender = {}));
var bloodType;
(function (bloodType) {
    bloodType["O"] = "O";
    bloodType["A"] = "A";
    bloodType["B"] = "B";
    bloodType["X"] = "X";
})(bloodType = exports.bloodType || (exports.bloodType = {}));
class personalInfo {
    constructor(id, name, age, gender, bloodType, weight, height, bloodPressure, pulse, oxygen) {
        this.id = id;
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
    constructor(patientId, dateOfVisit, doctorName, reasonOfVisit, prescription) {
        this.patientId = patientId;
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
    constructor(id, name, age, password = "password") {
        this.id = id;
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
    // sign(password:string, transaction:string){
    //   var signature:Buffer = Buffer.alloc(0)
    //   if(password === this.password){
    //     console.log("transaction signed succesfully")
    //     const sign = crypto.createSign('SHA256');
    //     sign.update(transaction.toString()).end();
    //     signature = sign.sign(this.privateKey); 
    //     return signature.toString("hex")
    //   }
    //   else{
    //     console.log("wrong password")
    //     return signature.toString("hex")
    //   }
    // }
    verify_signiture(sign, transaction) {
        //const signature_buffer = Buffer.from(signature, "utf-8");
        const signature = Buffer.from(sign, "hex");
        const doctor_PK = this.publicKey;
        const doctor_name = this.name;
        const verify = crypto.createVerify('SHA256');
        verify.update(transaction);
        // console.log("Used To Check:" + sign)
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
    constructor(signiture, text, visit, patientInfo, prevTransa) {
        this.signiture = signiture;
        this.text = text;
        this.visit = visit;
        this.patientInfo = patientInfo;
        this.prevTransa = prevTransa;
    }
    toString() {
        return JSON.stringify(this);
    }
    stringForPrinting() {
        return "{ \n" + "signiture: " + this.signiture + "\ntext: " + this.text + "\nvisit: " + this.visit +
            "\npatientInfo: " + this.patientInfo + "\n}";
    }
    setText(newText) {
        this.text = newText;
    }
    getText() {
        if (!!this.text)
            return this.text;
        else
            return "";
    }
    getSignature() {
        return this.signiture;
    }
    deleteData() {
        this.visit = undefined;
        this.patientInfo = undefined;
    }
    retrieveData(decryption) {
        this.text = undefined;
        var temp = JSON.parse(decryption);
        if (!!temp.patientInfo) {
            var temp3 = JSON.parse(temp.patientInfo);
            this.patientInfo = new personalInfo(temp3.id, temp3.name, temp3.age, temp3.gender, temp3.bloodType, temp3.weight, temp3.height, temp3.bloodPressure, temp3.pulse, temp3.oxygen);
        }
        else {
            var temp2 = JSON.parse(temp.visitInfo);
            this.visit = new visitInfo(temp2.patientId, temp2.dateOfVisit, temp2.doctorName, temp2.reasonOfVisit, temp2.prescription);
        }
    }
    encryptData(blockchain_key, blockchain_iv) {
        var _a, _b;
        const patient_cipher = createCipheriv('aes256', blockchain_key, blockchain_iv);
        let data = { patientInfo: (_a = this.patientInfo) === null || _a === void 0 ? void 0 : _a.toString(),
            visitInfo: (_b = this.visit) === null || _b === void 0 ? void 0 : _b.toString() };
        let stringData = JSON.stringify(data);
        var encrypted_info = patient_cipher.update(stringData, 'utf8', 'hex') + patient_cipher.final('hex');
        this.setText(encrypted_info);
        this.deleteData();
    }
    decryptData(blockchain_key, blockchain_iv) {
        const decipher_function = createDecipheriv('aes256', blockchain_key, blockchain_iv);
        //console.log("Text:- " + this.transaction?.text)
        var decrypted_data = decipher_function.update(this.text, 'hex', 'utf8') + decipher_function.final('utf8');
        this.retrieveData(decrypted_data);
        return this;
    }
}
exports.Transaction = Transaction;
class Block {
    constructor(transaction, prevHash, previousBlock) {
        this.transaction = transaction;
        this.prevHash = prevHash;
        this.previousBlock = previousBlock;
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
        var _a, _b, _c, _d, _e, _f;
        const patient_cipher = createCipheriv('aes256', blockchain_key, blockchain_iv);
        let data = { patientInfo: (_b = (_a = this.transaction) === null || _a === void 0 ? void 0 : _a.patientInfo) === null || _b === void 0 ? void 0 : _b.toString(),
            visitInfo: (_d = (_c = this.transaction) === null || _c === void 0 ? void 0 : _c.visit) === null || _d === void 0 ? void 0 : _d.toString() };
        let stringData = JSON.stringify(data);
        var encrypted_info = patient_cipher.update(stringData, 'utf8', 'hex') + patient_cipher.final('hex');
        (_e = this.transaction) === null || _e === void 0 ? void 0 : _e.setText(encrypted_info);
        (_f = this.transaction) === null || _f === void 0 ? void 0 : _f.deleteData();
    }
    decryptData(blockchain_key, blockchain_iv) {
        var _a, _b;
        const decipher_function = createDecipheriv('aes256', blockchain_key, blockchain_iv);
        //console.log("Text:- " + this.transaction?.text)
        var decrypted_data = decipher_function.update((_a = this.transaction) === null || _a === void 0 ? void 0 : _a.text, 'hex', 'utf8') + decipher_function.final('utf8');
        (_b = this.transaction) === null || _b === void 0 ? void 0 : _b.retrieveData(decrypted_data);
    }
}
exports.Block = Block;
class blockchain {
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        let privateKey = keypair.privateKey;
        let publicKey = keypair.publicKey;
        const text = "Genesis";
        const sign = crypto.createSign('SHA256');
        sign.update(text).end();
        const signature = sign.sign(privateKey);
        const Genesis_Transaction = new Transaction(signature.toString("hex"), text);
        this.lastBlock = new Block(Genesis_Transaction, "0000", undefined);
        this.doctors = [];
        this.patients = [];
        this.blockchain_key = randomBytes(32);
        this.blockchain_iv = randomBytes(16);
    }
    mine(nonce) {
        let solution = 1;
        console.log('⛏️  mining...');
        while (true) {
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();
            const attempt = hash.digest('hex');
            if (attempt.substr(0, 4) === '0000') {
                console.log(`Solved: ${solution}`);
                return solution;
            }
            solution += 1;
        }
    }
    addPatient(docPrivateKey, name, age, gender, bloodType, weight, height, bloodPressure, pulse, oxygen) {
        const newPatient = new personalInfo(this.patients.length, name, age, gender, bloodType, weight, height, bloodPressure, pulse, oxygen);
        this.patients.push(newPatient);
        this.addPatientBlock(docPrivateKey, newPatient);
    }
    addDoctor(name, age, password) {
        const curr_doctor = new Doctor(this.doctors.length, name, age, password);
        this.doctors.push(curr_doctor);
        return curr_doctor;
    }
    findTransWithId(Id) {
        var _a, _b, _c, _d;
        var curr_block = this.lastBlock;
        while (!!curr_block) {
            curr_block.decryptData(this.blockchain_key, this.blockchain_iv);
            if (((_b = (_a = curr_block.transaction) === null || _a === void 0 ? void 0 : _a.patientInfo) === null || _b === void 0 ? void 0 : _b.id) == Id || ((_d = (_c = curr_block.transaction) === null || _c === void 0 ? void 0 : _c.visit) === null || _d === void 0 ? void 0 : _d.patientId) == Id) {
                curr_block.encryptData(this.blockchain_key, this.blockchain_iv);
                return curr_block.transaction;
            }
            else {
                curr_block.encryptData(this.blockchain_key, this.blockchain_iv);
                curr_block = curr_block.previousBlock;
            }
        }
        return undefined;
    }
    addVisitBlock(docPrivateKey, Transa) {
        // const preTrans: Transaction | undefined = this.findTransWithId(Transa.patientId);
        // const sign = crypto.createSign('SHA256');
        // sign.update(Transa.toString()).end();
        // const signature = sign.sign(docPrivateKey); 
        // const curr_Transaction = new Transaction(signature.toString("hex"), undefined, Transa, preTrans);
        // const str = JSON.stringify(this.lastBlock);
        // const hash = crypto.createHash('SHA256');
        // const curr = hash.update(str).end();
        // we mine here
        let nonce = Math.round(Math.random() * 999999999);
        this.mine(nonce);
        const preTrans = this.findTransWithId(Transa.patientId);
        var newTransaction = undefined;
        if (!!preTrans) {
            newTransaction = new Transaction(preTrans.signiture, preTrans.text, preTrans.visit, preTrans.patientInfo, preTrans.prevTransa);
        }
        const curr_Transaction = new Transaction("0000", undefined, Transa, undefined, newTransaction);
        this.lastBlock = new Block(curr_Transaction, this.lastBlock.hash, this.lastBlock);
        this.lastBlock.encryptData(this.blockchain_key, this.blockchain_iv);
        const sign = crypto.createSign('SHA256');
        sign.update(this.lastBlock.transaction.getText()).end();
        const signature = sign.sign(docPrivateKey);
        this.lastBlock.transaction.signiture = signature.toString("hex");
    }
    addPatientBlock(docPrivateKey, Transa) {
        // we mine here
        let nonce = Math.round(Math.random() * 999999999);
        this.mine(nonce);
        const curr_Transaction = new Transaction("0000", undefined, undefined, Transa, undefined);
        this.lastBlock = new Block(curr_Transaction, this.lastBlock.hash, this.lastBlock);
        this.lastBlock.encryptData(this.blockchain_key, this.blockchain_iv);
        const sign = crypto.createSign('SHA256');
        sign.update(this.lastBlock.transaction.getText()).end();
        const signature = sign.sign(docPrivateKey);
        this.lastBlock.transaction.signiture = signature.toString("hex");
    }
    traverseChain() {
        var curr_block = this.lastBlock;
        while (!!curr_block) {
            console.log("previous Hash: " + curr_block.prevHash + ", Transaction: " + curr_block.transaction);
            curr_block = curr_block.previousBlock;
            console.log("________________________");
        }
    }
    checkIntegrity() {
        var _a;
        var curr_block = this.lastBlock;
        let integrityKept = true;
        while (!!curr_block) {
            let checkHash = curr_block.prevHash;
            if (!!curr_block.previousBlock) {
                let blockHash = (_a = curr_block.previousBlock) === null || _a === void 0 ? void 0 : _a.hash;
                if (checkHash !== blockHash) {
                    integrityKept = false;
                    break;
                }
            }
            curr_block = curr_block.previousBlock;
        }
        if (integrityKept === true) {
            console.log("Integrity Kept");
        }
        else {
            console.log("A Block Has Been Compromised");
        }
    }
    getAllTransactions(patientId) {
        const preTrans = this.findTransWithId(patientId);
        if (!!preTrans) {
            const newTransaction = new Transaction(preTrans.signiture, preTrans.text, preTrans.visit, preTrans.patientInfo, preTrans.prevTransa);
            newTransaction.decryptData(this.blockchain_key, this.blockchain_iv);
            var childTransaction = newTransaction.prevTransa;
            console.log(newTransaction.stringForPrinting());
            while (!!childTransaction) {
                childTransaction.decryptData(this.blockchain_key, this.blockchain_iv);
                console.log(childTransaction.stringForPrinting());
                childTransaction === null || childTransaction === void 0 ? void 0 : childTransaction.encryptData(this.blockchain_key, this.blockchain_iv);
                childTransaction = childTransaction.prevTransa;
            }
            newTransaction.encryptData(this.blockchain_key, this.blockchain_iv);
        }
    }
}
exports.blockchain = blockchain;
let visit1 = new visitInfo(0, new Date("2019-01-16"), "D1", "lab", "dead");
let visit2 = new visitInfo(1, new Date("2019-01-17"), "D1", "lab", "almost dead");
let visit3 = new visitInfo(1, new Date("2019-01-17"), "D1", "lab", "almost dead");
//console.log(randomBytes(32).toString());
let test = new blockchain();
let doctor1 = test.addDoctor("D1", 56, "12345");
let doctor2 = test.addDoctor("D2", 56, "12345");
test.addPatient(doctor1.privateKey, "P1", 27, gender["male"], bloodType["A"], 77, 170, 170, 180, 12);
test.addVisitBlock(doctor1.privateKey, visit1);
test.addPatient(doctor1.privateKey, "P2", 27, gender["male"], bloodType["A"], 77, 170, 170, 180, 12);
test.addVisitBlock(doctor1.privateKey, visit2);
test.addVisitBlock(doctor1.privateKey, visit3);
//console.log("Decrypted Block")
//test.lastBlock.decryptData(test.blockchain_key, test.blockchain_iv)
//test.traverseChain();
// doctor1.verify_signiture(test.lastBlock.transaction?.signiture, test.lastBlock.transaction.getText())
// doctor2.verify_signiture(test.lastBlock.transaction?.signiture, test.lastBlock.transaction.getText())
// let block = test.lastBlock.previousBlock
// test.checkIntegrity()
// test.getAllTransactions(1)
// test.traverseChain();
let currUserName = "";
let currLoggedInDoctor = undefined;
function logIn() {
    const rl = readline.createInterface({
        input: process_1.stdin,
        output: process_1.stdout
    });
    rl.question("Please Enter Your User Name \n", function (answer) {
        console.log(`Oh, so your name is ${answer}`);
        rl.close();
        if (answer === "end") {
            console.log("Closing the interface");
            return;
        }
        else {
            let flag = false;
            for (let i = 0; i < test.doctors.length; i++) {
                let currName = test.doctors[i].name;
                if (answer === currName) {
                    currUserName = currName;
                    currLoggedInDoctor = test.doctors[i];
                    flag = true;
                    break;
                }
            }
            if (flag) {
                const r2 = readline.createInterface({
                    input: process_1.stdin,
                    output: process_1.stdout
                });
                r2.question("Enter Your Password \n", function (answer) {
                    console.log(`Oh, so your name is ${answer}`);
                    r2.close();
                    if (!!currLoggedInDoctor) {
                        if (answer === currLoggedInDoctor.password) {
                            console.log("Successfully Logged In");
                            insideInterface();
                        }
                        else {
                            console.log("Wrong Password");
                            return;
                        }
                    }
                    else {
                        console.log("No User Name Enteed Before");
                        return;
                    }
                });
            }
            else {
                console.log("User Name Not Found");
                return;
            }
        }
    });
}
function addPatient() {
    const rl = readline.createInterface({
        input: process_1.stdin,
        output: process_1.stdout
    });
    rl.question("Please Add The data of the patient in the following format: \n name, age, gender, bloodType, weight, height, bloodPressure, pulse, oxygen \n", function (answer) {
        console.log(`Oh, so your name is ${answer}`);
        let input = answer.split(",");
        if (!!currLoggedInDoctor) {
            // gender["male"],bloodType["A"]
            let gen = gender["male"];
            if (input[2].trim() === "male") {
                gen = gender["male"];
            }
            else {
                gen = gender["female"];
            }
            let blood = bloodType["A"];
            if (input[3].trim() === "O") {
                blood = bloodType["O"];
            }
            else if (input[3].trim() === "A") {
                blood = bloodType["A"];
            }
            else if (input[3].trim() === "B") {
                blood = bloodType["B"];
            }
            else {
                blood = bloodType["X"];
            }
            test.addPatient(currLoggedInDoctor === null || currLoggedInDoctor === void 0 ? void 0 : currLoggedInDoctor.privateKey, input[0].trim(), parseInt(input[1].trim()), gen, blood, parseInt(input[4].trim()), parseInt(input[5].trim()), parseInt(input[6].trim()), parseInt(input[7].trim()), parseInt(input[8].trim()));
            test.lastBlock.decryptData(test.blockchain_key, test.blockchain_iv);
            console.log(test.traverseChain());
        }
        else {
            console.log("Not Logged In Baka");
            return;
        }
        rl.close();
        if (answer === "end") {
            console.log("Closing the interface");
            return;
        }
        else {
            insideInterface();
        }
    });
}
function insideInterface() {
    console.log("Main Page");
    const rl = readline.createInterface({
        input: process_1.stdin,
        output: process_1.stdout
    });
    rl.question("What is your name? \n", function (answer) {
        console.log(`Oh, so your name is ${answer}`);
        rl.close();
        if (answer === "end") {
            console.log("Closing the interface");
            return;
        }
        else if (answer === "addPatient") {
            addPatient();
            return;
        }
        else {
            insideInterface();
        }
    });
}
function startInterface() {
    console.log("Welcome To Our Block Chain System :)");
    const rl = readline.createInterface({
        input: process_1.stdin,
        output: process_1.stdout
    });
    rl.question("Want To Login Or Create Account \n", function (answer) {
        console.log(`Oh, so your name is ${answer}`);
        rl.close();
        if (answer === "end") {
            console.log("Closing the interface");
            return;
        }
        else if (answer === "Login") {
            logIn();
        }
        else if (answer === "Create") {
            console.log("Creating Account -- Not Yet Developed");
            return;
        }
        else {
            console.log("Please Enter A Valid Input Dumbass :)");
            startInterface();
        }
    });
}
startInterface();
// test.addBlock("second block ever");
// test.addBlock("Third block ever")
//test.traverseChain();
//console.log(test.lastBlock.previousBlock?.prevHash);
