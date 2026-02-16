import { uuidv7 } from "zod";
import { IUserRequest } from "../../interfaces"
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface"
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";

const bookAppointment = async (payload: IBookAppointmentPayload, user: IUserRequest) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false,
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId,
        }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
            }
        });

        //TODO : Payment Integration will be here

        return {
            appointmentData,
        };
    });

    return {
        appointment: result.appointmentData,
    };
}

const getMyAppointments = async (user: IUserRequest) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointments = [];

    if (patientData) {
        appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    } else if (doctorData) {
        appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    } else {
        throw new AppError(status.BAD_REQUEST, "User not found as patient or doctor");
    }

    return appointments;
}

const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IUserRequest) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true
        }
    });


    if (user?.role === Role.DOCTOR) {
        if (!(user?.email === appointmentData.doctor.email))
            throw new AppError(status.BAD_REQUEST, "This is not your appointment")
    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status: appointmentStatus
        }
    })
}

const getMySingleAppointment = async (appointmentId: string, user: IUserRequest) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointment;

    if (patientData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    } else if (doctorData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    }

    if (!appointment) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    return appointment;
}

const getAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            doctor: true,
            patient: true,
            schedule: true
        }
    });
    return appointments;
}

const bookAppointmentWithPayLater = async () => { }

const initialPayment = async () => { }

const cancelUnpaidAppointments = async () => { }

export const AppointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initialPayment,
    cancelUnpaidAppointments
} 