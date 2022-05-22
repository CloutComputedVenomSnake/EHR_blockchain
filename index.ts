const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');

import { verify } from 'node:crypto';
import {personalInfo, visitInfo, Doctor, Transaction, gender, bloodType} from './class_file'
import * as readline from 'node:readline';
import { stdin, stdout } from 'process';
//patient 1
const patient = new personalInfo("patient 1", 20, gender["male"], bloodType["X"], 80, 180, 50, 120, 60)
// console.log(typeof patient.toString()) //string

const patient_data = patient.toString()
const blockchain_key = randomBytes(32)
const blockchain_iv = randomBytes(16)

// patient cipher 

const patient_cipher = createCipheriv('aes256', blockchain_key, blockchain_iv)

//patient encryption

const encrypted_info = patient_cipher.update(patient_data, 'utf8', 'hex') + patient_cipher.final('hex')
console.log(`Encrypted Patient data: ${encrypted_info}`)

//decryption of data

const decipher_function = createDecipheriv('aes256', blockchain_key, blockchain_iv)
const decrypted_data = decipher_function.update(encrypted_info, 'hex', 'utf8') + decipher_function.final('utf8')
console.log(`Dencrypted Patient data: ${decrypted_data}`)

const patient_2 = new personalInfo()
let temp = JSON.parse(decrypted_data)
Object.assign(patient_2, temp);
console.log(patient_2)



const doctor_1 = new Doctor("Doctor_1", 50)
console.log(doctor_1.publicKey)

const signature = doctor_1.sign("password", patient_data)
var transaction:Transaction;
transaction = new Transaction(patient_data, signature)
const doctor_2 = new Doctor("doctor_2", 80 ,"password2")
var signature_test:Buffer = Buffer.alloc(0)
doctor_1.verify_signiture(signature_test, transaction.transaction)
console.log(transaction.transaction)



const rl = readline.createInterface({
    input: stdin,
    output: stdout
  });
  
  rl.question("What is your name? \n", function (answer: string) {
    console.log(`Oh, so your name is ${answer}`);
    if(answer === "Alei"){
      console.log("Closing the interface");
    }
    rl.close();
  });




// const patient_2 = new personalInfo(temp)
/// Cipher

// const message = 'i like turtles';
// const key = randomBytes(32);
// const iv = randomBytes(16);

// const cipher = createCipheriv('aes256', key, iv);

// /// Encrypt

// const encryptedMessage = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
// console.log(`Encrypted: ${encryptedMessage}`);

// /// Decrypt

// const decipher = createDecipheriv('aes256', key, iv);
// const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
// console.log(`Deciphered: ${decryptedMessage.toString('utf-8')}`);