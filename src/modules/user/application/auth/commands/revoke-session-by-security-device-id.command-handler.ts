import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { SecurityDevice } from '../../../domain/security-devices/security-device.entity';
import { RevokeSessionBySecurityDeviceIdCommand } from './revoke-session-by-security-device-id.command';

/*Обработчик команды для отзыва пользовательской сессии по ID пользовательского устройства.*/
@CommandHandler(RevokeSessionBySecurityDeviceIdCommand)
export class RevokeSessionBySecurityDeviceIdCommandHandler implements ICommandHandler<RevokeSessionBySecurityDeviceIdCommand> {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository
  ) {}

  public async execute({ deviceId, userRefreshJwtAuthContext }: RevokeSessionBySecurityDeviceIdCommand): Promise<void> {
    /*Получаем ID пользователя.*/
    const userId: string = userRefreshJwtAuthContext.id;
    /*Просим репозиторий "SecurityDevicesRepository" найти пользовательское устройство по ID в БД.*/
    const securityDevice: SecurityDevice | null = await this.securityDevicesRepository.findById(deviceId);

    /*Если пользовательское устройство не было найдено, то выбрасываем исключение с информацией об этом.*/
    if (!securityDevice)
      throw new DomainException({
        code: DomainExceptionCode.SecurityDeviceNotfoundWhileRevokingSessionBySecurityDeviceId,
        message: 'Security device to revoke a session not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем пользовательского устройства, то выбрасываем исключение с информацией об
    этом.*/
    if (securityDevice.userId !== userId)
      throw new DomainException({
        code: DomainExceptionCode.WrongSecurityDeviceOwnerWhileRevokingSessionBySecurityDeviceId,
        message: 'The user is not the owner of the security device to revoke a session',
        field: 'id',
      });

    /*Если пользователь является владельцем пользовательского устройства, то просим репозиторий "AuthRepository" hard
    удалить пользовательскую сессию по ID пользователя и ID пользовательского устройства в БД.*/
    await this.authRepository.deleteSessionByUserIdAndDeviceId(userId, deviceId);
    /*Просим репозиторий "SecurityDevicesRepository" удалить пользовательское устройство по ID в БД.*/
    await this.securityDevicesRepository.deleteById(deviceId);
  }
}
