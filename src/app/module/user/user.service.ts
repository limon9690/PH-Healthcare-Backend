import { Role, Specialty } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

const createDoctor = async (paylaod : ICreateDoctorPayload) => {
    const specialities : Specialty[] = [];

    for(const specialtyId of paylaod.specialties) {
        const specialty = await prisma.specialty.findUnique({
            where: 
            { id: specialtyId } 
        });

        if(!specialty) {
            throw new Error(`Specialty with ID ${specialtyId} not found`);
        }
        specialities.push(specialty);
    }

    const existingDoctor = await prisma.doctor.findUnique({
        where: { email: paylaod.doctor.email }
    });

    if(existingDoctor) {
        throw new Error(`Doctor with email ${paylaod.doctor.email} already exists`);
    }
    
    const userData = await auth.api.signUpEmail({
        body: {
            email: paylaod.doctor.email,
            password: paylaod.password,
            role: Role.DOCTOR,
            name: paylaod.doctor.name,
            needsPasswordChange: true
        }
    })


    try {
        const doctorData = await prisma.$transaction(async (tx) => {
            const doctor = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...paylaod.doctor,
                }
            })
            
            const doctorSpecialtiesData = specialities.map((specialty) => ({
                doctorId: doctor.id,
                specialtyId: specialty.id
            }))

            await tx.doctorSpecialty.createMany({
                data: doctorSpecialtiesData
            })

            const doctorResult = await tx.doctor.findUnique({
                where: { id: doctor.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualifications: true,
                    currentWorkingPlace: true,
                    designation: true,
                    averageRating: true,
                    User: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            deletedAt: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                    specialties: {
                        select: {
                            Specialty: {
                                select: {
                                    title: true,
                                    id: true
                                }
                            }
                        }
                    }
                    
                }
            })

            return doctorResult;
        });

        return doctorData
    } catch (error) {
        console.error("Transaction error:", error);
        // Rollback user creation if doctor creation fails
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        });
        throw error;
    }
}

export const UserService = {
    createDoctor
}