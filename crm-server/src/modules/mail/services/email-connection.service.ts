import { brevo } from "../brevo.config";

export async function verifyConnection(): Promise<boolean> {
    try {
        await brevo.account.getAccount();
        console.log('Email connection verified');
        return true;
    } catch (error) {
        console.error('Error verifying email connection:', error);
        return false;
    }
}