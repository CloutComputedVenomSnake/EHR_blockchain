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
exports.Doctor = exports.visitInfo = exports.personalInfo = void 0;
const crypto = __importStar(require("crypto"));
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
exports.visitInfo = visitInfo;
class Doctor {
    constructor(name, password, age) {
        this.name = name;
        this.password = password;
        this.age = age;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Doctor = Doctor;