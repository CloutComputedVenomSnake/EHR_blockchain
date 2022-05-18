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
  
  constructor(
    public name: string,
    public password: string, 
    public age: number,

  ) {}

  toString() {
    return JSON.stringify(this);
  }
}