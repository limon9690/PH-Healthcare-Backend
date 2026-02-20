import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IUserRequest } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";
import { uploadToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

const givePrescription = async (user: IUserRequest, payload: ICreatePrescriptionPayload) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        },
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId
        },
        include: {
            patient: true,
            doctor: {
                include: {
                    specialties: true
                }
            },
            schedule: {
                include: {
                    doctorSchedules: true
                }
            },
        }
    });

    if (appointmentData.doctorId !== doctorData.id) {
        throw new AppError(status.BAD_REQUEST, "You can only give prescription for your own appointments");
    }

    const isAlreadyPrescribed = await prisma.prescription.findFirst({
        where: {
            appointmentId: payload.appointmentId
        }
    });

    if (isAlreadyPrescribed) {
        throw new AppError(status.BAD_REQUEST, "You have already given prescription for this appointment. You can update the prescription instead.");
    }

    const followUpDate = new Date(payload.followUpDate);

    const result = await prisma.$transaction(async (tx) => {
        const result = await tx.prescription.create({
            data: {
                ...payload,
                followUpDate,
                doctorId: appointmentData.doctorId,
                patientId: appointmentData.patientId,
            }
        });

        const pdfBuffer = await generatePrescriptionPDF({
            doctorName: doctorData.name,
            patientName: appointmentData.patient.name,
            appointmentDate: appointmentData.schedule.startDateTime,
            instructions: payload.instructions,
            followUpDate,
            doctorEmail: doctorData.email,
            patientEmail: appointmentData.patient.email,
            prescriptionId: result.id,
            createdAt: new Date(),
        });

        const fileName = `Prescription-${Date.now()}.pdf`;
        const uploadedFile = await uploadToCloudinary(pdfBuffer, fileName);
        const pdfUrl = uploadedFile.secure_url;

        const updatedPrescription = await tx.prescription.update({
            where: {
                id: result.id
            },
            data: {
                pdfUrl
            }
        });

        try {
            const patient = appointmentData.patient;
            const doctor = appointmentData.doctor;

            await sendEmail({
                to: patient.email,
                subject: `You have received a new prescription from Dr. ${doctor.name}`,
                templateName: "prescription",
                templateData: {
                    doctorName: doctor.name,
                    patientName: patient.name,
                    specialization: doctor.specialties.map((s: any) => s.title).join(", "),
                    appointmentDate: new Date(appointmentData.schedule.startDateTime).toLocaleString(),
                    issuedDate: new Date().toLocaleDateString(),
                    prescriptionId: result.id,
                    instructions: payload.instructions,
                    followUpDate: followUpDate.toLocaleDateString(),
                    pdfUrl: pdfUrl
                },
                attachments: [
                    {
                        filename: fileName,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            })
        } catch (error) {
            console.log("Failed To send email notification for prescription", error);
        }

        return updatedPrescription;
    }, {
        maxWait: 15000,
        timeout: 20000,
    });

    return result;
}

const myPrescriptions = async (user: IUserRequest) => { }

const getAllPrescriptions = async () => { }

const updatePrescription = async (user: IUserRequest, prescriptionId: string, payload: any) => { }

const deletePrescription = async (user: IUserRequest, prescriptionId: string) => { }

export const PrescriptionService = {
    givePrescription,
    myPrescriptions,
    getAllPrescriptions,
    updatePrescription,
    deletePrescription
}