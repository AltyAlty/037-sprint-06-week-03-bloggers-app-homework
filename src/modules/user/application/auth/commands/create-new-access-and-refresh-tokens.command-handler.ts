import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { AuthConfig } from '../../../config/auth.config';
import { Session } from '../../../domain/auth/session.entity';
import { SecurityDevice } from '../../../domain/security-devices/security-device.entity';
import { CreateNewAccessAndRefreshTokensCommand } from './create-new-access-and-refresh-tokens.command';
import { UserTokensDataDTO } from './dto/user-tokens-data.dto';

/*Обработчик команды для создания новых AT и RT.*/
@CommandHandler(CreateNewAccessAndRefreshTokensCommand)
export class CreateNewAccessAndRefreshTokensCommandHandler implements ICommandHandler<CreateNewAccessAndRefreshTokensCommand> {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository
  ) {}

  public async execute({
    userRefreshJwtAuthContext,
    ipAndUserAgent,
  }: CreateNewAccessAndRefreshTokensCommand): Promise<UserTokensDataDTO> {
    /*Получаем ID пользователя.*/
    const userId: string = userRefreshJwtAuthContext.id;
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = userRefreshJwtAuthContext.deviceId;
    /*Получаем значение заголовка "user-agent".*/
    const userAgent: string = ipAndUserAgent.userAgent;
    /*Получаем IP-адрес пользователя.*/
    const ip: string = ipAndUserAgent.ip;

    /*Просим сервис "JwtService" создать AT.*/
    const accessToken: string = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.authConfig.AT_SECRET,
        expiresIn: this.authConfig.AT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      }
    );

    /*Просим сервис "JwtService" создать RT.*/
    const refreshToken: string = await this.jwtService.signAsync(
      { userId, deviceId },
      {
        secret: this.authConfig.RT_SECRET,
        expiresIn: this.authConfig.RT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      }
    );

    /*Получаем payload из RT.*/
    const { iat: refreshTokenIat, exp: refreshTokenExp }: { iat: number; exp: number } =
      await this.jwtService.decode(refreshToken);

    /*Формируем даты создания и истечения RT.*/
    const refreshTokenIatDate: Date = new Date(refreshTokenIat * 1000);
    const refreshTokenExpDate: Date = new Date(refreshTokenExp * 1000);

    /*Просим репозиторий "AuthRepository" найти пользовательскую сессию по ID пользователя, ID пользовательского
    устройства и дате выдачи RT в БД.*/
    const session: Session | null = await this.authRepository.findSessionByUserIdAndDeviceIdAndIat(
      userId,
      deviceId,
      userRefreshJwtAuthContext.iat
    );

    /*Если пользовательская сессия была найдена, то изменяем ее.*/
    if (session) {
      /*Изменяем пользовательскую сессию.*/
      session.update({ iat: refreshTokenIatDate, exp: refreshTokenExpDate });
      /*Просим репозиторий "AuthRepository" сохранить измененную пользовательскую сессию в БД.*/
      await this.authRepository.saveSession(session);
    }

    /*Просим репозиторий "SecurityDevicesRepository" найти пользовательское устройство по ID в БД.*/
    const securityDevice: SecurityDevice | null = await this.securityDevicesRepository.findById(deviceId);

    /*Если пользовательское устройство было найдено, то изменяем его.*/
    if (securityDevice) {
      /*Изменяем пользовательское устройство.*/
      securityDevice.update({ title: userAgent, ip, lastActiveDate: refreshTokenIatDate });
      /*Просим репозиторий "securityDevicesRepository" сохранить измененное пользовательское устройство в БД.*/
      await this.securityDevicesRepository.save(securityDevice);
    }

    /*Возвращаем новые AT и RT.*/
    return { accessToken, refreshToken };
  }
}
