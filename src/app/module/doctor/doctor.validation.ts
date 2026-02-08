import z from "zod";

export const updateDoctorSchema = z.object({
    name: z.string().min(2, "name must be at least 4 characters long").max(30, "name must be at most 30 characters long"),
    profilePhoto: z.string(),
    contactNumber: z.string().min(10, "contact number must be at least 10 characters long").max(15, "contact number must be at most 15 characters long"),
    address: z.string(),
    experience: z.number().min(0, "experience must be at least 0 years").max(50, "experience must be at most 50 years"),
    appointmentFee: z.number().min(0, "appointment fee must be at least 0").max(10000, "appointment fee must be at most 10000"),
    qualifications: z.string().min(2, "qualifications must be at least 2 characters long").max(100, "qualifications must be at most 100 characters long"),
    currentWorkingPlace: z.string().min(5, "current working place must be at least 2 characters long").max(50, "current working place must be at most 50 characters long"),
    designation: z.string().min(2, "designation must be at least 2 characters long").max(50, "designation must be at most 50 characters long"),
}).partial();