import { Console } from 'console';
import * as crypto from 'crypto';
import internal from 'stream';
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');

import fs from 'fs';
//import { text } from 'stream/consumers';

export enum gender{
  male = "Male",
  female = "Female"
}

export enum bloodType{
  O = "O",
  A = "A",
  X = "X"
}

export class personalInfo {
  
  constructor(
    public id?: number,
    public name?: string, 
    public age?: number,
    public gender?: gender,
    public bloodType?: bloodType,
    public weight?: number,
    public height?: number,
    public bloodPressure?: number,
    public pulse?: number,
    public oxygen?: number
  ) {  }
  

  toString() {
    return JSON.stringify(this);
  }
}

export class visitInfo {

  
    constructor(
      public patientId: number, 
      public dateOfVisit: Date,
      public doctorName: string,
      public reasonOfVisit: string,
      public prescription: string
    ) { }
  
    toString() {
      return JSON.stringify(this);
    }
}

export class Doctor{
  

    public publicKey: string;
    public privateKey: string;
  
    constructor(
      public id: number,
      public name: string,
      public age: number,
      public password: string = "password",
  
    ) {
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
  
    verify_signiture(sign:string, transaction:string){
      //const signature_buffer = Buffer.from(signature, "utf-8");
      const signature:Buffer = Buffer.from(sign, "hex")
      const doctor_PK = this.publicKey
      const doctor_name = this.name
      const verify = crypto.createVerify('SHA256');
      verify.update(transaction);

      // console.log("Used To Check:" + sign)
  
      const isValid = verify.verify(doctor_PK, signature);
  
      if(signature.length === 0){
        console.log("this is not a valid signature")
      }
      else if (isValid) {
        console.log(`doctor ${doctor_name} signed this visit`)
      }
      else{
        console.log("this doctor did not sign this message")
      }
    }
}
  


export class Transaction{

  
    constructor(
      public signiture:string,
      public text?: string,
      public visit?: visitInfo,
      public patientInfo?: personalInfo,
      public prevTransa?: Transaction
    ) {}
    
  
    toString() {
      return JSON.stringify(this);
    }

    stringForPrinting() {
      return "{ \n" + "signiture: " + this.signiture + "\ntext: " + this.text + "\nvisit: " + this.visit +
       "\npatientInfo: " + this.patientInfo + "\n}";
    }

    setText(newText:string){
      this.text = newText
    }

    getText(){
      if(!!this.text)
        return this.text
      else
        return ""
    }

    getSignature(){
      return this.signiture
    }

    deleteData(){
      this.visit = undefined
      this.patientInfo = undefined
    }

    retrieveData(decryption:string){
      this.text = undefined
      
      var temp = JSON.parse(decryption as string);

      if(!!temp.patientInfo){

        var temp3 = JSON.parse(temp.patientInfo as string);

        this.patientInfo = new personalInfo(temp3.id, temp3.name, temp3.age, temp3.gender, 
          temp3.bloodType, temp3.weight, temp3.height, temp3.bloodPressure, temp3.pulse, temp3.oxygen);
      }
      else{
        var temp2 = JSON.parse(temp.visitInfo as string);

        this.visit = new visitInfo(temp2.patientId, temp2.dateOfVisit, temp2.doctorName, temp2.reasonOfVisit, temp2.prescription);
      }
      
    }

    encryptData(blockchain_key:any, blockchain_iv:any) {
      
      const patient_cipher = createCipheriv('aes256', blockchain_key, blockchain_iv)

      let data = {patientInfo: this.patientInfo?.toString(), 
                    visitInfo: this.visit?.toString()};

      let stringData = JSON.stringify(data)

      var encrypted_info = patient_cipher.update(stringData, 'utf8', 'hex') + patient_cipher.final('hex')

      this.setText(encrypted_info)
      this.deleteData()

    }

    decryptData(blockchain_key:any, blockchain_iv:any) {

      const decipher_function = createDecipheriv('aes256', blockchain_key, blockchain_iv)
      //console.log("Text:- " + this.transaction?.text)
      var decrypted_data = decipher_function.update(this.text, 'hex', 'utf8') + decipher_function.final('utf8')

      this.retrieveData(decrypted_data)
      
      return this
    }
}



export class Block{
  public constructor(public transaction: Transaction, public prevHash?:string, public previousBlock?: Block){
  }
  toString() {
      return JSON.stringify(this);
    }

    get hash(){
      const str = JSON.stringify(this);
      const hash = crypto.createHash('SHA256');
      hash.update(str).end();
      return hash.digest('hex');
    }
  
    get lastHash(){
      return this.prevHash
    }
  
    getTransaction(){
      return this.transaction
      
    }
  
    encryptData(blockchain_key:any, blockchain_iv:any) {
      
      const patient_cipher = createCipheriv('aes256', blockchain_key, blockchain_iv)

      let data = {patientInfo: this.transaction?.patientInfo?.toString(), 
                    visitInfo: this.transaction?.visit?.toString()};

      let stringData = JSON.stringify(data)

      var encrypted_info = patient_cipher.update(stringData, 'utf8', 'hex') + patient_cipher.final('hex')

      this.transaction?.setText(encrypted_info)
      this.transaction?.deleteData()

    }
  
    decryptData(blockchain_key:any, blockchain_iv:any) {

      const decipher_function = createDecipheriv('aes256', blockchain_key, blockchain_iv)
      //console.log("Text:- " + this.transaction?.text)
      var decrypted_data = decipher_function.update(this.transaction?.text, 'hex', 'utf8') + decipher_function.final('utf8')

      this.transaction?.retrieveData(decrypted_data)
      
    }
}



export class blockchain{

  public blockchain_key
  public blockchain_iv

  public lastBlock: Block;
  public doctors: Doctor[];
  public patients: personalInfo[]; 

  constructor(){
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
      this.lastBlock = new Block(Genesis_Transaction, "0000", undefined)
      this.doctors = [];
      this.patients = [];
      this.blockchain_key = randomBytes(32);
      this.blockchain_iv = randomBytes(16);
  }

  mine(nonce: number) {
    let solution = 1;
    console.log('⛏️  mining...')

    while(true) {

      const hash = crypto.createHash('MD5');
      hash.update((nonce + solution).toString()).end();

      const attempt = hash.digest('hex');

      if(attempt.substr(0,4) === '0000'){
        console.log(`Solved: ${solution}`);
        return solution;
      }

      solution += 1;
    }
  }

  addPatient(docPrivateKey: string, name: string, age: number, gender: gender, bloodType: bloodType, weight: number, height: number, bloodPressure: number, pulse: number, oxygen: number){
      const newPatient = new personalInfo(this.patients.length, name, age, gender, bloodType, weight, height, bloodPressure, pulse, oxygen);
      this.patients.push(newPatient);
      this.addPatientBlock(docPrivateKey, newPatient);
  }

  addDoctor(name: string, age: number, password: string){
    const curr_doctor = new Doctor(this.doctors.length, name, age, password)
    this.doctors.push(curr_doctor);
    return curr_doctor
  }

  findTransWithId(Id: number){
    var curr_block: Block | undefined = this.lastBlock;
      while(!!curr_block){

        curr_block.decryptData(this.blockchain_key, this.blockchain_iv)

        if(curr_block.transaction?.patientInfo?.id == Id || curr_block.transaction?.visit?.patientId == Id){

          curr_block.encryptData(this.blockchain_key, this.blockchain_iv)

          return curr_block.transaction;
        }

        else{
          curr_block.encryptData(this.blockchain_key, this.blockchain_iv)

          curr_block = curr_block.previousBlock;
        }
      }
      return undefined;
  }

  addVisitBlock(docPrivateKey: string, Transa: visitInfo){
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
    this.mine(nonce)

    const preTrans: Transaction | undefined = this.findTransWithId(Transa.patientId);

    var newTransaction = undefined
    if(!!preTrans){
      newTransaction = new Transaction(preTrans.signiture, preTrans.text, preTrans.visit, preTrans.patientInfo, preTrans.prevTransa)
    }

    const curr_Transaction = new Transaction("0000", undefined, Transa, undefined, newTransaction);


    this.lastBlock = new Block(curr_Transaction, this.lastBlock.hash, this.lastBlock);

    this.lastBlock.encryptData(this.blockchain_key, this.blockchain_iv)

    const sign = crypto.createSign('SHA256');

    sign.update(this.lastBlock.transaction.getText()).end();
    const signature = sign.sign(docPrivateKey); 

    this.lastBlock.transaction.signiture = signature.toString("hex")

  }

  addPatientBlock(docPrivateKey: string, Transa: personalInfo){

    // we mine here
    let nonce = Math.round(Math.random() * 999999999);
    this.mine(nonce)

    
    const curr_Transaction = new Transaction("0000", undefined, undefined, Transa, undefined);

    this.lastBlock = new Block(curr_Transaction, this.lastBlock.hash, this.lastBlock);

    this.lastBlock.encryptData(this.blockchain_key, this.blockchain_iv)

    const sign = crypto.createSign('SHA256');
    sign.update(this.lastBlock.transaction.getText()).end();
    const signature = sign.sign(docPrivateKey); 

    this.lastBlock.transaction.signiture = signature.toString("hex")

  }

  traverseChain(){
      var curr_block: Block | undefined = this.lastBlock;
      while(!!curr_block){
          console.log("previous Hash: "+curr_block.prevHash+", Transaction: "+ curr_block.transaction)
          curr_block = curr_block.previousBlock;
          console.log("________________________")
      }
  }

  checkIntegrity(){
    var curr_block: Block | undefined = this.lastBlock;

    let integrityKept = true
    while(!!curr_block){

      let checkHash = curr_block.prevHash

      if(!!curr_block.previousBlock){
        let blockHash = curr_block.previousBlock?.hash;

        if(checkHash !== blockHash){
          integrityKept = false
          break;
        }
      }

      curr_block = curr_block.previousBlock
    }

    if(integrityKept === true){
      console.log("Integrity Kept")
    }
    else{
      console.log("A Block Has Been Compromised")
    }
  }

  getAllTransactions(patientId:number){
    const preTrans: Transaction | undefined = this.findTransWithId(patientId);

    if(!!preTrans){
      const newTransaction = new Transaction(preTrans.signiture, preTrans.text, preTrans.visit, preTrans.patientInfo, preTrans.prevTransa)

      newTransaction.decryptData(this.blockchain_key, this.blockchain_iv)

      var childTransaction = newTransaction.prevTransa

      console.log(newTransaction.stringForPrinting())


      while(!!childTransaction){
        childTransaction.decryptData(this.blockchain_key, this.blockchain_iv)

        console.log(childTransaction.stringForPrinting())

        childTransaction?.encryptData(this.blockchain_key, this.blockchain_iv)

        childTransaction = childTransaction.prevTransa
      }

      newTransaction.encryptData(this.blockchain_key, this.blockchain_iv)
    }
  }

}

let visit1 = new visitInfo(0,new Date("2019-01-16"), "D1","lab","dead");
let visit2 = new visitInfo(1,new Date("2019-01-17"), "D1","lab","almost dead");
let visit3 = new visitInfo(1,new Date("2019-01-17"), "D1","lab","almost dead");

//console.log(randomBytes(32).toString());

let test = new blockchain();
let doctor1: Doctor = test.addDoctor("D1", 56,"12345");
let doctor2: Doctor = test.addDoctor("D2", 56,"12345");

console.log("Used To Sign:" + doctor1.publicKey)

test.addPatient(doctor1.privateKey, "P1", 27, gender["male"],bloodType["A"],77,170,170,180,12);
test.addVisitBlock(doctor1.privateKey, visit1);
test.addPatient(doctor1.privateKey, "P2", 27, gender["male"],bloodType["A"],77,170,170,180,12);
test.addVisitBlock(doctor1.privateKey, visit2);
test.addVisitBlock(doctor1.privateKey, visit3);


//console.log("Decrypted Block")

//test.lastBlock.decryptData(test.blockchain_key, test.blockchain_iv)
//test.traverseChain();


doctor1.verify_signiture(test.lastBlock.transaction?.signiture, test.lastBlock.transaction.getText())
doctor2.verify_signiture(test.lastBlock.transaction?.signiture, test.lastBlock.transaction.getText())


let block = test.lastBlock.previousBlock

test.checkIntegrity()

test.getAllTransactions(1)

test.traverseChain();


// test.addBlock("second block ever");
// test.addBlock("Third block ever")
//test.traverseChain();
//console.log(test.lastBlock.previousBlock?.prevHash);