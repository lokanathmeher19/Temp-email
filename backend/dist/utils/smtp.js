"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSMTPServer = void 0;
const smtp_server_1 = require("smtp-server");
const mailparser_1 = require("mailparser");
const prisma_1 = require("./prisma");
const socket_1 = require("./socket");
const startSMTPServer = () => {
    const server = new smtp_server_1.SMTPServer({
        secure: false, // We use false for local dev. Behind a proxy like Nginx it would handle TLS.
        authOptional: true, // Allow receiving emails without auth
        // Accept any incoming message
        onData(stream, session, callback) {
            (0, mailparser_1.simpleParser)(stream, async (err, parsed) => {
                if (err) {
                    console.error('Error parsing email:', err);
                    return callback();
                }
                try {
                    // We might receive email for multiple recipients, let's extract the ones matching our domains
                    const domains = (process.env.SUPPORTED_DOMAINS || 'tempmail.local').split(',');
                    // Check if any recipient matches an active mailbox in our DB
                    const recipients = Array.isArray(parsed.to) ? parsed.to : [parsed.to];
                    for (const recipient of recipients) {
                        if (!recipient)
                            continue;
                        const emailAddresses = recipient.value.map((v) => v.address?.toLowerCase()).filter(Boolean);
                        for (const address of emailAddresses) {
                            const mailbox = await prisma_1.prisma.mailbox.findFirst({
                                where: {
                                    address,
                                    status: 'ACTIVE'
                                }
                            });
                            if (mailbox) {
                                // Save the email
                                const email = await prisma_1.prisma.email.create({
                                    data: {
                                        mailboxId: mailbox.id,
                                        fromAddress: parsed.from?.text || 'Unknown',
                                        fromName: parsed.from?.value[0]?.name || null,
                                        subject: parsed.subject || 'No Subject',
                                        bodyText: parsed.text || '',
                                        bodyHtml: parsed.html || '',
                                        rawSource: null, // Would store to S3 here in production
                                    }
                                });
                                // Handle Attachments (stub for now, would upload to S3)
                                if (parsed.attachments && parsed.attachments.length > 0) {
                                    for (const attachment of parsed.attachments) {
                                        await prisma_1.prisma.attachment.create({
                                            data: {
                                                emailId: email.id,
                                                filename: attachment.filename || 'unknown',
                                                contentType: attachment.contentType,
                                                size: attachment.size || 0,
                                                url: 'https://placeholder.com/attachment', // Placeholder
                                            }
                                        });
                                    }
                                }
                                // Push realtime event
                                const io = (0, socket_1.getIO)();
                                io.to(mailbox.id).emit('new_email', {
                                    mailboxId: mailbox.id,
                                    email
                                });
                                console.log(`Saved and broadcasted email for ${address}`);
                            }
                        }
                    }
                }
                catch (dbErr) {
                    console.error('Database error saving email:', dbErr);
                }
                callback();
            });
        }
    });
    const PORT = process.env.SMTP_PORT || 1025;
    server.listen(Number(PORT), () => {
        console.log(`SMTP Receiver running on port ${PORT}`);
    });
};
exports.startSMTPServer = startSMTPServer;
