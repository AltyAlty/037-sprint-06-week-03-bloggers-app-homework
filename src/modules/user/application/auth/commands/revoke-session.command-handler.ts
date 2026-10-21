import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { RevokeSessionCommand } from './revoke-session.command';

/*Обработчик команды для отзыва пользовательской сессии.*/
@CommandHandler(RevokeSessionCommand)
export class RevokeSessionCommandHandler implements ICommandHandler<RevokeSessionCommand> {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository
  ) {}

  public async execute({ userRefreshJwtAuthContext }: RevokeSessionCommand): Promise<void> {
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = userRefreshJwtAuthContext.deviceId;
    /*Просим репозиторий "AuthRepository" hard удалить пользовательскую сессию по ID пользователя, ID пользовательского
    устройства и дате выдачи RT в БД.*/
    await this.authRepository.deleteSessionByUserIdAndDeviceIdAndIat(
      userRefreshJwtAuthContext.id,
      deviceId,
      userRefreshJwtAuthContext.iat
    );

    /*Просим репозиторий "SecurityDevicesRepository" hard удалить пользовательское устройство по ID в БД.*/
    await this.securityDevicesRepository.deleteById(deviceId);
  }
}
