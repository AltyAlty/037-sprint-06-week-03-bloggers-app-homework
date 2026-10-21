import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './api/auth/auth.controller';
import { SecurityDevicesController } from './api/security-devices/security-devices.controller';
import { UsersSaController } from './api/users/users-sa.controller';
import { AuthService } from './application/auth/auth.service';
import { CommentsRepository } from '../blog/infrastructure/comments/comments.repository';
import { AuthRepository } from './infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from './infrastructure/security-devices/security-devices.repository';
import { UsersRepository } from './infrastructure/users/users.repository';
import { SecurityDevicesQueryRepository } from './infrastructure/security-devices/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { CoreModule } from '../../core/core.module';
import { AccessJwtAuthStrategy } from '../../core/guards/access-jwt-auth/access-jwt-auth.strategy';
import { LocalAuthStrategy } from '../../core/guards/local-auth/local-auth.strategy';
import { RefreshJwtAuthStrategy } from '../../core/guards/refresh-jwt-auth/refresh-jwt-auth.strategy';
import { Comment } from '../blog/domain/comments/comment.entity';
import { CommentLikeData } from '../blog/domain/comments/comment-like-data.entity';
import { AuthUserCommandHandler } from './application/auth/commands/auth-user.command-handler';
import { ConfirmUserByCodeCommandHandler } from './application/auth/commands/confirm-user-by-code.command-handler';
import { CreateNewAccessAndRefreshTokensCommandHandler } from './application/auth/commands/create-new-access-and-refresh-tokens.command-handler';
import { RegisterUserCommandHandler } from './application/auth/commands/register-user.command-handler';
import { ResendConfirmationEmailCommandHandler } from './application/auth/commands/resend-confirmation-email.command-handler';
import { RevokeAllSessionsExceptCurrentOneCommandHandler } from './application/auth/commands/revoke-all-sessions-except-current-one.command-handler';
import { RevokeSessionCommandHandler } from './application/auth/commands/revoke-session.command-handler';
import { RevokeSessionBySecurityDeviceIdCommandHandler } from './application/auth/commands/revoke-session-by-security-device-id.command-handler';
import { SendPasswordRecoveryCodeCommandHandler } from './application/auth/commands/send-password-recovery-code.command-handler';
import { UpdatePasswordByPasswordRecoveryCodeCommandHandler } from './application/auth/commands/update-password-by-password-recovery-code.command-handler';
import { ResendCompleteRegistrationEmailEventHandler } from './application/auth/events/resend-complete-registration-email.event-handler';
import { SendCompleteRegistrationEmailEventHandler } from './application/auth/events/send-complete-registration-email.event-handler';
import { SendPasswordRecoveryCodeEmailEventHandler } from './application/auth/events/send-password-recovery-code-email.event-handler';
import { GetAuthUserDataByAccessTokenQueryHandler } from './application/auth/queries/get-auth-user-data-by-access-token.query-handler';
import { GetSecurityDeviceListByUserIdQueryHandler } from './application/security-devices/queries/get-security-device-list-by-user-id.query-handler';
import { CreateConfirmedUserCommandHandler } from './application/users/commands/create-confirmed-user.command-handler';
import { MarkUserAsDeletedByIdCommandHandler } from './application/users/commands/mark-user-as-deleted-by-id.command-handler';
import { GetUserListQueryHandler } from './application/users/queries/get-user-list.query-handler';
import { AuthConfigModule } from './config/auth-config.module';
import { EmailConfirmation } from './domain/auth/email-confirmation.entity';
import { PasswordRecoveryCodeData } from './domain/auth/password-recovery-code-data.entity';
import { Session } from './domain/auth/session.entity';
import { SecurityDevice } from './domain/security-devices/security-device.entity';
import { User } from './domain/users/users.entity';

/*Модуль для пользователей.*/
@Module({
  imports: [
    AuthConfigModule,
    CoreModule,
    PassportModule.register({ defaultStrategy: 'access-jwt' }),
    TypeOrmModule.forFeature([
      Comment,
      CommentLikeData,
      User,
      EmailConfirmation,
      PasswordRecoveryCodeData,
      Session,
      SecurityDevice,
    ]),
  ],
  controllers: [AuthController, SecurityDevicesController, UsersSaController],
  providers: [
    LocalAuthStrategy,
    AccessJwtAuthStrategy,
    RefreshJwtAuthStrategy,
    JwtService,
    CreateConfirmedUserCommandHandler,
    GetUserListQueryHandler,
    MarkUserAsDeletedByIdCommandHandler,
    GetSecurityDeviceListByUserIdQueryHandler,
    RevokeSessionBySecurityDeviceIdCommandHandler,
    RevokeAllSessionsExceptCurrentOneCommandHandler,
    RegisterUserCommandHandler,
    ResendConfirmationEmailCommandHandler,
    ConfirmUserByCodeCommandHandler,
    SendPasswordRecoveryCodeCommandHandler,
    UpdatePasswordByPasswordRecoveryCodeCommandHandler,
    AuthUserCommandHandler,
    CreateNewAccessAndRefreshTokensCommandHandler,
    RevokeSessionCommandHandler,
    GetAuthUserDataByAccessTokenQueryHandler,
    SendCompleteRegistrationEmailEventHandler,
    ResendCompleteRegistrationEmailEventHandler,
    SendPasswordRecoveryCodeEmailEventHandler,
    AuthService,
    AuthRepository,
    SecurityDevicesRepository,
    UsersRepository,
    CommentsRepository,
    SecurityDevicesQueryRepository,
    UsersQueryRepository,
  ],
  exports: [AuthConfigModule, AccessJwtAuthStrategy, AuthService],
})
export class UserModule {}
