import nodemailer from 'nodemailer';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import status from 'http-status';
import path from 'path';
import ejs from 'ejs';

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_USER,
        pass: envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_PASSWORD,
    },
    port: Number(envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_PORT)
});

interface IEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[];
}

export const sendEmail = async (options: IEmailOptions) => {
    const { to, subject, templateName, templateData, attachments } = options;

    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from : envVars.EMAIL_SENDER.EMAIL_SENDER_SMTP_USER,
            to,
            subject,
            html,
            attachments: attachments?.map(attachments => ({
                filename: attachments.filename,
                content: attachments.content,
                contentType: attachments.contentType
            })) || []
        });

        console.log(`Email sent to ${to}, status ID: ${info.accepted}`);

    } catch (error: any) {
        console.log('Error sending email:', error);
        throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to send email');
    }

}
