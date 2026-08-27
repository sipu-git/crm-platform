import bcrypt from 'bcrypt';
import { prisma } from '../../../../../lib/prisma';
import { ApiError } from '../../../../shared/utils/ApiError';
import { clearAllOTPs } from '../../../../shared/redis/store-otp';

export async function resetPasswordWithToken(email: string, newPassword: string
): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) throw ApiError.notFound('User not found');

        const allUsers = await prisma.user.findMany({
            select: { id: true, password: true },
        });

        for (const existingUser of allUsers) {
            const isMatch = await bcrypt.compare(newPassword, existingUser.password);
            if (isMatch) {
                if (existingUser.id === user.id) {
                    throw ApiError.badRequest('New password must be different from your old password');
                } else {
                    throw ApiError.badRequest('This password has already been used by someone. Please choose a unique password');
                }
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, updatedAt: new Date() },
        });

        await clearAllOTPs(email);

        return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
        throw error;
    }
}