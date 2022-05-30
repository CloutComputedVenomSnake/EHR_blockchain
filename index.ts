const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');

import { verify } from 'node:crypto';
import {personalInfo, visitInfo, Doctor, Transaction, gender, bloodType, Block, chain} from './class_file'
import * as readline from 'node:readline';
import { stdin, stdout } from 'process';



// let x = unSerializeChain()

// console.log("X Size")
// var count = Object.keys(x).length;
// console.log(count);

// serializeChain()

// x = unSerializeChain()


// console.log("X Size")
// var count = Object.keys(x).length;
// console.log(count);

//patient 1
const patient = new personalInfo("patient 1", 20, gender["male"], bloodType["X"], 80, 180, 50, 120, 60)
const visitTest = new visitInfo(patient, new Date(), "Hasan", "Want to suicide", "Do it")
const doctor_test = new Doctor("Doctor_test", 50)
const doctor_4 = new Doctor("Doctor_4", 150)
// console.log(typeof patient.toString()) //string

const patient_data = patient.toString()
const visit_data = visitTest.toString()

// chain.instance.createBlock(patient_data, doctor_test)
chain.instance.createBlock(visit_data, doctor_test)

// get the transaction data from the block

let temp = chain.instance.getBlock(1).getTransaction();
var temp2 = JSON.parse(temp as string);
const currTransaction = new Transaction(temp2.transaction, temp2.signiture);
//console.log(temp2);
//Object.assign(currTransaction, temp2);

console.log(currTransaction.transaction);

doctor_test.verify_signiture(currTransaction.signiture, currTransaction.transaction)
doctor_4.verify_signiture(currTransaction.signiture, currTransaction.transaction)


// checks if patientInfo field is not null/undefined if so then it is a visitInfo record
var test = JSON.parse(currTransaction.transaction as string);
//console.log(!!test.patientInfo)







// console.log(chain.instance.getBlock(0).hash)

// for(let i = 0;i < chain.instance.blockchain.length;i++){
//   console.log(chain.instance.getBlock(i).prevHash)
// }
// console.log(chain.instance.getBlock(2,"password"))
// const blockchain_key = randomBytes(32)
// const blockchain_iv = randomBytes(16)

// // patient cipher 

// const patient_cipher = createCipheriv('aes256', blockchain_key, blockchain_iv)

// //patient encryption

// const encrypted_info = patient_cipher.update(patient_data, 'utf8', 'hex') + patient_cipher.final('hex')
// // console.log(`Encrypted Patient data: ${encrypted_info}`)

// //decryption of data

// const decipher_function = createDecipheriv('aes256', blockchain_key, blockchain_iv)
// const decrypted_data = decipher_function.update(encrypted_info, 'hex', 'utf8') + decipher_function.final('utf8')
// console.log(`Dencrypted Patient data: ${decrypted_data}`)

// const patient_2 = new personalInfo()
//let temp = JSON.parse(decrypted_data)
//Object.assign(patient_2, temp);
// console.log(patient_2)



// const doctor_1 = new Doctor("Doctor_1", 50)
// const doctor_2 = new Doctor("doctor_2", 80 ,"password2")
// // console.log(doctor_1.publicKey)

// const signature = doctor_2.sign("password2", patient_data)
// var transaction:Transaction;
// transaction = new Transaction(patient_data, signature)
// var signature_test:Buffer = Buffer.alloc(0)
// doctor_1.verify_signiture(signature, transaction.transaction)
//console.log(transaction.transaction)


// chain.instance.addBlock(new Block(chain.instance.lastBlock.lastHash, encrypted_info))

// console.log(chain.instance)

// console.log(chain.instance.lastBlock.getTransaction("password"))

//var temp2 = chain.instance.lastBlock.getTransaction()

// const decipher_function_2 = createDecipheriv('aes256', blockchain_key, blockchain_iv)
// const decrypted_data2 = decipher_function_2.update(temp2, 'hex', 'utf8') + decipher_function_2.final('utf8')

//console.log(decrypted_data2)









// const rl = readline.createInterface({
//     input: stdin,
//     output: stdout
//   });
  
//   rl.question("What is your name? \n", function (answer: string) {
//     console.log(`Oh, so your name is ${answer}`);
//     if(answer === "Alei"){
//       console.log("Closing the interface");
//     }
//     rl.close();
//   });




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