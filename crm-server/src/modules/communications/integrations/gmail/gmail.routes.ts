import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { authGuard } from '../../../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../../../shared/middleware/asyncHandler.middleware.js';
import { createOAuthClient } from './gmail.config.js';
import { prisma } from '../../../../../lib/prisma.js';
import { encrypt } from './utils/encryption.util.js';
import { gmailService } from './gmail.service.js';
import { successResponse } from '../../../../shared/utils/ApiResponse.js';
import { ApiError } from '../../../../shared/utils/ApiError.js';

const router = Router();

router.get('/connect', authGuard, (req: Request, res: Response) => {
    const oauth2Client = createOAuthClient();

    const statePayload = JSON.stringify({
        userId: req.auth!.userId,
        tenantId: req.auth!.tenantId,
    });

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
        state: statePayload,
    });

    return res.status(200).json(successResponse('Gmail auth URL generated', { url }));
});

router.get('/oauth/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
     const frontendUrl = process.env.PRODUCTION_URL ?? 'https://crm-platform-weld.vercel.app';

    if (!code || !state) {
        return res.redirect(`${frontendUrl}/settings/email?error=missing_params`);
    }

    let userId: string, tenantId: string;
    try {
        ({ userId, tenantId } = JSON.parse(state));
    } catch {
        return res.redirect(`${frontendUrl}/settings/email?error=invalid_state`);
    }

    try {
        const oauth2Client = createOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const { data: profile } = await oauth2.userinfo.get();

        if (!profile.email) {
            return res.redirect(`${frontendUrl}/settings/email?error=no_email_returned`);
        }

        const existing = await prisma.emailAccount.findUnique({
            where: { user_id_email: { user_id: userId, email: profile.email } },
        });

        await prisma.emailAccount.upsert({
            where: { user_id_email: { user_id: userId, email: profile.email } },
            update: {
                access_token: encrypt(tokens.access_token!),
                refresh_token: tokens.refresh_token
                    ? encrypt(tokens.refresh_token)
                    : existing!.refresh_token,
                token_expiry: new Date(tokens.expiry_date!),
                is_active: true,
            },
            create: {
                tenant_id: tenantId,
                user_id: userId,
                email: profile.email,
                access_token: encrypt(tokens.access_token!),
                refresh_token: encrypt(tokens.refresh_token!),
                token_expiry: new Date(tokens.expiry_date!),
                is_active: true,
            },
        });

        // Adjust to your actual frontend origin (use an env var in production).
        res.redirect(`${frontendUrl}/http://localhost:5173/settings/email?connected=true`);
    } catch (err) {
        console.error('Gmail OAuth callback failed:', err);
        res.redirect(`${frontendUrl}http://localhost:5173/settings/email?error=oauth_failed`);
    }
});

// ─── Authenticated Gmail REST endpoints ──────────────────────────────────────

router.use(authGuard, tenantContext);

/** GET /gmail/status  — check if the current user has a connected Gmail account */
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
    const status = await gmailService.getStatus(req.auth!.userId);
    return res.status(200).json(successResponse('Gmail account status', status));
}));

/** GET /gmail/accounts  — list all connected Gmail accounts for the user */
router.get('/accounts', asyncHandler(async (req: Request, res: Response) => {
    const accounts = await gmailService.listAccounts(req.auth!.userId);
    return res.status(200).json(successResponse('Gmail accounts fetched', accounts));
}));

/** DELETE /gmail/accounts/:accountId  — disconnect a Gmail account */
router.delete('/accounts/:accountId', asyncHandler(async (req: Request, res: Response) => {
    const accountId = req.params.accountId as string;
    if (!accountId) {
        throw ApiError.badRequest("Account id is required!");
    }
    const result = await gmailService.disconnect(req.auth!.userId, accountId);
    return res.status(200).json(successResponse('Gmail account disconnected', result));
}));

/** GET /gmail/inbox  — fetch recent inbox messages from connected Gmail */
router.get('/inbox', asyncHandler(async (req: Request, res: Response) => {
    const max = Math.min(Number(req.query.limit ?? 20), 50);
    const messages = await gmailService.listInbox(req.auth!.userId, max);
    return res.status(200).json(successResponse('Inbox fetched', messages));
}));

/** POST /gmail/send  — send an email via Gmail API */
router.post('/send', asyncHandler(async (req: Request, res: Response) => {
    const { to, subject, body, threadId } = req.body as {
        to: string;
        subject: string;
        body: string;
        threadId?: string;
    };

    if (!to) throw new ApiError(400, '"to" email address is required');
    if (!subject) throw new ApiError(400, '"subject" is required');
    if (!body) throw new ApiError(400, '"body" is required');

    const result = await gmailService.sendEmail({
        userId: req.auth!.userId,
        to,
        subject,
        body,
        threadId,
    });
    return res.status(201).json(successResponse('Email sent successfully', result));
}));

router.post('/sync', asyncHandler(async (req: Request, res: Response) => {
    const result = await gmailService.syncInbox(req.auth!.userId, req.auth!.tenantId);
    return res.status(200).json(successResponse('Inbox synced', result));
}));

export default router;