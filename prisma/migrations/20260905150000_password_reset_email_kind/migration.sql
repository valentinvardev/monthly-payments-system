-- AlterEnum
-- El mail de recuperación de contraseña ahora lo manda el sistema (Resend)
-- y queda registrado en EmailLog con su propio tipo, en vez de prestarse
-- MAGIC_LINK_INFO.
ALTER TYPE "EmailKind" ADD VALUE 'PASSWORD_RESET';
