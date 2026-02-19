import { IUserRequest } from "../../interfaces";
import { ICreatePrescriptionPayload } from "./prescription.interface";

const givePrescription = async (user : IUserRequest, payload : ICreatePrescriptionPayload) => {}

const myPrescriptions = async (user : IUserRequest) => {}

const getAllPrescriptions = async () => {}

const updatePrescription = async (user : IUserRequest, prescriptionId : string, payload : any) => {}

const deletePrescription = async (user : IUserRequest, prescriptionId : string) => {}

export const PrescriptionService = {
    givePrescription,
    myPrescriptions,
    getAllPrescriptions,
    updatePrescription,
    deletePrescription
}