import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
    password: z.string("password is required").min(6, "password must be at least 6 characters long").max(20, "password must be at most 20 characters long"),
    doctor: z.object({
        name: z.string("name is required").min(2, "name must be at least 4 characters long").max(30, "name must be at most 30 characters long"),
        email: z.email("valid email is required"),
        profilePhoto: z.string().optional(),
        contactNumber: z.string().min(10, "contact number must be at least 10 characters long").max(15, "contact number must be at most 15 characters long").optional(),
        address: z.string().optional(),
        registrationNumber: z.string("registration number is required"),
        experience: z.number("experience is required").min(0, "experience must be at least 0 years").max(50, "experience must be at most 50 years"),
        gender: z.enum([Gender.FEMALE, Gender.MALE], "gender must be either MALE or FEMALE"),
        appointmentFee: z.number("appointment fee is required").min(0, "appointment fee must be at least 0").max(10000, "appointment fee must be at most 10000"),
        qualifications: z.string("qualifications are required").min(2, "qualifications must be at least 2 characters long").max(100, "qualifications must be at most 100 characters long"),
        currentWorkingPlace: z.string("current working place is required").min(5, "current working place must be at least 2 characters long").max(50, "current working place must be at most 50 characters long"),
        designation: z.string("designation is required").min(2, "designation must be at least 2 characters long").max(50, "designation must be at most 50 characters long"),
    }),
    specialties: z.array(z.uuid(), "specialties must be an array of strings").min(1, "at least one specialty is required"),
})