import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { RevokeAllSessionsExceptCurrentOneCommand } from './revoke-all-sessions-except-current-one.command';

/*Обработчик команды для отзыва всех пользовательских сессий, кроме текущей.*/
@CommandHandler(RevokeAllSessionsExceptCurrentOneCommand)
export class RevokeAllSessionsExceptCurrentOneCommandHandler implements ICommandHandler<RevokeAllSessionsExceptCurrentOneCommand> {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository
  ) {}

  public async execute({ userRefreshJwtAuthContext }: RevokeAllSessionsExceptCurrentOneCommand): Promise<void> {
    /*Получаем ID пользователя.*/
    const userId: string = userRefreshJwtAuthContext.id;
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = userRefreshJwtAuthContext.deviceId;
    /*Просим репозиторий "AuthRepository" hard удалить все пользовательские сессии по ID пользователя и ID
    пользовательского устройства в БД.*/
    await this.authRepository.deleteAllSessionsExceptCurrentOneByUserIdAndSecurityDeviceId(userId, deviceId);
    /*Просим репозиторий "SecurityDevicesRepository" hard удалить все пользовательские устройства, кроме текущего, по ID
    пользовательского устройства и ID пользователя в БД.*/
    await this.securityDevicesRepository.deleteAllExceptCurrentOneBySecurityDeviceIdAndUserId(deviceId, userId);
  }
}
