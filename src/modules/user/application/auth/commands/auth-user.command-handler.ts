import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { AuthConfig } from '../../../config/auth.config';
import { Session } from '../../../domain/auth/session.entity';
import { SecurityDevice } from '../../../domain/security-devices/security-device.entity';
import { AuthUserCommand } from './auth-user.command';
import { UserTokensDataDTO } from './dto/user-tokens-data.dto';

/*Обработчик команды для аутентификации пользователя.*/
@CommandHandler(AuthUserCommand)
export class AuthUserCommandHandler implements ICommandHandler<AuthUserCommand> {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository
  ) {}

  public async execute({ userLocalAuthContext, ipAndUserAgent }: AuthUserCommand): Promise<UserTokensDataDTO> {
    /*Получаем ID пользователя.*/
    const userId: string = userLocalAuthContext.id;
    /*Генерируем ID пользовательского устройства.*/
    const deviceId: string = randomUUID();
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

    /*Создаем пользовательское устройство.*/
    const securityDevice: SecurityDevice = SecurityDevice.create({
      deviceId,
      userId,
      title: userAgent,
      ip,
      lastActiveDate: refreshTokenIatDate,
    });

    /*Просим репозиторий "SecurityDevicesRepository" сохранить пользовательское устройство в БД.*/
    await this.securityDevicesRepository.save(securityDevice);
    /*Создаем пользовательскую сессию.*/
    const session: Session = Session.create({ userId, deviceId, iat: refreshTokenIatDate, exp: refreshTokenExpDate });
    /*Просим репозиторий "AuthRepository" сохранить пользовательскую сессию в БД.*/
    await this.authRepository.saveSession(session);
    /*Возвращаем AT и RT.*/
    return { accessToken, refreshToken };
  }
}
