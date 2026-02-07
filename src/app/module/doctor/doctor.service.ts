import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctor.interface";

const getAllDoctors = async () => {
    const resutl = await prisma.doctor.findMany({
        include: {
            User: true,
            specialties: {
                include: {
                    Specialty: true

                }
            },
        }
    });
    return resutl;
}

const getSingleDoctor = async (doctorId: string) => {
    const result = await prisma.doctor.findUnique({
        where: {
            id: doctorId
        },
        include: {
            User: true,
            specialties: {
                include: {
                    Specialty: true
                }
            }
        }
    });
    return result;
}

const updateDoctor = async (updateDoctorPayload : IUpdateDoctorPayload, doctorId: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId
        }
    });

    if (!doctor) {
        throw new Error('Doctor not found');
    }
    
    const result = await prisma.doctor.update({
        where: {
            id: doctorId
        },
        data: {
            ...updateDoctorPayload
        }
    });
    return result;
}

const deleteDoctor = async (doctorId: string) => {
    const result = await prisma.doctor.delete({
        where: {
            id: doctorId
        }
    });
    return result;
}

export const DoctorService = {
    getAllDoctors,
    getSingleDoctor,
    updateDoctor,
    deleteDoctor
}