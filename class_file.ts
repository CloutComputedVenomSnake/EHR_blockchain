import { Console } from 'console';
import * as crypto from 'crypto';
import internal from 'stream';
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');

import fs from 'fs';

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
    public patientInfo: personalInfo, 
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
  private privateKey: string;

  constructor(
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
  
  sign(password:string, transaction:string){
    var signature:Buffer = Buffer.alloc(0)
    if(password === this.password){
      console.log("transaction signed succesfully")
      const sign = crypto.createSign('SHA256');
      sign.update(transaction.toString()).end();

      signature = sign.sign(this.privateKey); 
      return signature.toString("hex")
    }
    else{
      console.log("wrong password")
      return signature.toString("hex")
    }
  }

  verify_signiture(sign:string, transaction:string){
    //const signature_buffer = Buffer.from(signature, "utf-8");
    const signature:Buffer = Buffer.from(sign, "hex")
    const doctor_PK = this.publicKey
    const doctor_name = this.name
    const verify = crypto.createVerify('SHA256');
    verify.update(transaction);

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
    public transaction: string,
    public signiture:string 
  ) {}
  

  toString() {
    return JSON.stringify(this);
  }

}

export class Block{

  constructor(
    public prevHash?:string,
    private transaction?: string,
  ){}

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
    
    console.log(this.transaction)
    const patient_cipher = createCipheriv('aes256', chain.blockchain_key, chain.blockchain_iv)
    var encrypted_info = patient_cipher.update(this.transaction, 'utf8', 'hex') + patient_cipher.final('hex')

    this.transaction = encrypted_info
    
  }

  decryptData(blockchain_key:any, blockchain_iv:any) {

    const decipher_function = createDecipheriv('aes256', chain.blockchain_key, chain.blockchain_iv)
    var decrypted_data = decipher_function.update(this.transaction, 'hex', 'utf8') + decipher_function.final('utf8')

    this.transaction = decrypted_data
    
  }

  // getTransaction(password:string){
  //   if(password === "password"){
  //     return this.transaction
  //   }
  //   return "you are not authorized"
  // }

  // encryptData(password:string, blockchain_key:any, blockchain_iv:any) {
  //   if(password === "password"){

  //     const patient_cipher = createCipheriv('aes256', chain.blockchain_key, chain.blockchain_iv)
  //     var encrypted_info = patient_cipher.update(this.transaction, 'utf8', 'hex') + patient_cipher.final('hex')

  //     this.transaction = encrypted_info
  //   }
  // }

  // decryptData(password:string, blockchain_key:any, blockchain_iv:any) {
  //   if(password === "password"){

  //     const decipher_function = createDecipheriv('aes256', chain.blockchain_key, chain.blockchain_iv)
  //     var decrypted_data = decipher_function.update(this.transaction, 'hex', 'utf8') + decipher_function.final('utf8')

  //     this.transaction = decrypted_data
  //   }
  // }

}

let unSerializeChain = function(){
  try{
      
      let bufferedData = fs.readFileSync('./chain.json')
      let dataString = bufferedData.toString()
      let chainArray = JSON.parse(dataString)
      return chainArray
  }
  catch(error){
      return []
  }
}



export class chain{
  public static blockchain_key = randomBytes(32)
  public static blockchain_iv = randomBytes(16)

  public static instance = new chain();
  blockchain: Block[];
  private saved_key = chain.blockchain_key.toString()
  private saved_iv = chain.blockchain_iv.toString()

  constructor(){
    let fileData = unSerializeChain()
    console.log("Ran HERE")

    if(Object.keys(fileData).length === 0){
      var block:Block = new Block("0000", "Genesis Block")
      block.encryptData(chain.blockchain_key, chain.blockchain_iv)
      this.blockchain = [block]
      this.saved_key = chain.blockchain_key.toString('hex')
      this.saved_iv = chain.blockchain_iv.toString('hex')
      this.serializeChain(this)
    }

    else{
      chain.instance = fileData
      //Object.assign(chain.instance, temp);
      // var buf = new Buffer.from(chain.instance.saved_key.toString())

      var temp = chain.instance.blockchain
      this.blockchain = []
      for(var i = 0; i < chain.instance.blockchain.length;i++){
        this.blockchain.push(temp[i] as Block)
      }

      chain.blockchain_key = Buffer.from(chain.instance.saved_key, "hex");
      chain.blockchain_iv =  Buffer.from(chain.instance.saved_iv, "hex");
      console.log(chain.blockchain_key)
    }
  }

  serializeChain = function(currChain:chain){

    currChain.saved_key = chain.blockchain_key.toString('hex')
    currChain.saved_iv = chain.blockchain_iv.toString('hex')
    fs.writeFileSync('./chain.json', JSON.stringify(currChain))
    
  }

  toString() {
    return JSON.stringify(this);
  }

  get lastBlock(){
    const lastblock = new Block()
    let temp = this.blockchain[this.blockchain.length - 1]
    Object.assign(lastblock, temp);

    return lastblock
  }

  getBlock(pos:number){
    const currBlock:Block = new Block()
    let temp = this.blockchain[pos]
    Object.assign(currBlock, temp);

    // currBlock.decryptData(password, chain.blockchain_key, chain.blockchain_iv, chain.decipher_function)
    currBlock.decryptData(chain.blockchain_key, chain.blockchain_iv)

    console.log(currBlock)

    return currBlock
  }

  addBlock(Block:Block){
    
    // Block.encryptData(password, chain.blockchain_key, chain.blockchain_iv, chain.patient_cipher)
    Block.encryptData(chain.blockchain_key, chain.blockchain_iv)

    this.blockchain.push(Block);

    this.serializeChain(this)
  }
  

  createBlock(transaction:string, doctor:Doctor){
    const lastblock = chain.instance.lastBlock

    const signature = doctor.sign(doctor.password, transaction)

    if(signature.length === 0){
      console.log("Creation Failed ::: Wrong Password Entered")
    }
    else{

      const t:Transaction = new Transaction(transaction, signature)

      const block = new Block(lastblock.hash, t.toString())

      this.addBlock(block)
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