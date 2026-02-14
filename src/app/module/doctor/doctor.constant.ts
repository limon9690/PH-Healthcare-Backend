import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = ['name', 'email', 'qualification', 'experience', 'designation', 'currentWorkingPlace', 'registrationNumber', 'specialties.specialty.title'];

export const doctorFilterableFields = ['gender', 'isDeleted', 'appointmentFee', 'experience', 'registrationNumber', 'designation', 'currentWorkingPlace', 'specialties', 'specialty.title', 'qualification', 'user.role', 'specialties.specialty.title', 'specialties.specialty.id'];

export const doctorIncludeConfig : Partial<Record<keyof Prisma.DoctorInclude, Prisma.DoctorInclude[keyof Prisma.DoctorInclude]>> ={
    User: true,
    specialties: {
        include: {
            Specialty: true
        }
    },
    appointments: {
        include: {
            patient: true,
            doctor: true,

        }
    },
    doctorSchedules: {
        include: {
            schedule: true
        }
    },
    prescriptions: true,
    reviews: true,
}