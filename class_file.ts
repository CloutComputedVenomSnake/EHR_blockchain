import { Console } from 'console';
import * as crypto from 'crypto';

export class personalInfo {
  constructor(
    public name?: string, 
    public age?: number,
    public gender?: boolean,
    public bloodType?: string,
    public weight?: number,
    public height?: number,
    public bloodPressure?: number,
    public pulse?: number,
    public oxygen?: number
  ) {}
  

  toString() {
    return JSON.stringify(this);
  }
}

export class visitInfo {

  public publicKey: string;
  public privateKey: string;
  
  constructor(
    public patientInfo: personalInfo, 
    public dateOfVisit: Date,
    public doctorName: string,
    public reasonOfVisit: string,
    public prescription: string
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
}


export class Doctor{
  

  public publicKey: string;
  public privateKey: string;

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
      return signature
    }
    else{
      console.log("wrong password")
      return signature
    }
  }

  verify_signiture(signature:Buffer, transaction:string){
    //const signature_buffer = Buffer.from(signature, "utf-8");
    const doctor_PK = this.publicKey
    const doctor_name = this.name
    const verify = crypto.createVerify('SHA256');
    verify.update(transaction);

    const isValid = verify.verify(doctor_PK, signature);

    if(signature.length === 0){
      console.log("this is not a valid signature")
    }
    if (isValid) {
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
    public signiture:Buffer 
  ) {}
  

  toString() {
    return JSON.stringify(this);
  }

}