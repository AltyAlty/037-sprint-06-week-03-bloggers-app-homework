import { Injectable } from '@nestjs/common';
import { Argon2Adapter } from '../../../../core/security/cryptography/argon2.adapter';
import { AuthRepository } from '../../infrastructure/auth/auth.repository';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices/security-devices.repository';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { UserLocalAuthContextDTO } from '../../../../core/guards/local-auth/dto/user-local-auth-context.dto';
import { Session } from '../../domain/auth/session.entity';
import { SecurityDevice } from '../../domain/security-devices/security-device.entity';
import { User } from '../../domain/users/users.entity';
import { ValidateAccessJwtPayloadDTO } from './dto/validate-access-jwt-payload.dto';
import { ValidateRefreshJwtPayloadDTO } from './dto/validate-refresh-jwt-payload.dto';
import { ValidateUserLocalAuthCredentialsDTO } from './dto/validate-user-local-auth-credentials.dto';

/*Сервис для работы с аутентификацией и авторизацией.*/
@Injectable()
export class AuthService {
  public constructor(
    private readonly argon2Adapter: Argon2Adapter,
    private readonly authRepository: AuthRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  /*Метод для валидации учетных данных пользователя при аутентификации по логину или email и паролю.*/
  public async validateUserLocalAuthCredentials(
    dto: ValidateUserLocalAuthCredentialsDTO
  ): Promise<UserLocalAuthContextDTO | null> {
    /*Просим репозиторий "UsersRepository" найти пользователя по логину или email в БД.*/
    const user: User | null = await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);
    /*Если пользователь не был найден, то возвращаем null.*/
    if (!user) return null;
    /*Если у пользователя не была подтверждена регистрация, то возвращаем null.*/
    if (!user.isConfirmed) return null;
    /*Если пользователь был найден и его регистрация подтверждена, то просим адаптер "Argon2Adapter" валидировать
    пароль.*/
    const isPasswordValid: boolean = await this.argon2Adapter.checkPasswordByHash(dto.password, user.passwordHash);
    /*Если пароль оказался невалидным, то возвращаем null.*/
    if (!isPasswordValid) return null;
    /*Если пароль оказался валидным, то возвращаем ID пользователя.*/
    return { id: user.id.toString() };
  }

  /*Метод для валидации payload из Access JWT.*/
  public async validateAccessJwtPayload(dto: ValidateAccessJwtPayloadDTO): Promise<User | null> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    return await this.usersRepository.findById(dto.userId);
  }

  /*Метод для валидации payload из Refresh JWT.*/
  public async validateRefreshJwtPayload(dto: ValidateRefreshJwtPayloadDTO): Promise<User | null> {
    /*Получаем ID пользователя.*/
    const userId: string = dto.userId;
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = dto.deviceId;

    /*Просим репозиторий "AuthRepository" найти пользовательскую сессию по ID пользователя, ID пользовательского
    устройства и дате выдачи RT в БД.*/
    const session: Session | null = await this.authRepository.findSessionByUserIdAndDeviceIdAndIat(
      userId,
      deviceId,
      new Date(dto.iat * 1000)
    );

    /*Если пользовательская сессия не была найдена, то возвращаем null.*/
    if (!session) return null;
    /*Если пользовательская сессия была найдена, то просим репозиторий "SecurityDevicesRepository" найти
    пользовательское устройство по ID в БД.*/
    const securityDevice: SecurityDevice | null = await this.securityDevicesRepository.findById(deviceId);
    /*Если пользовательское устройство не было найдено, то возвращаем null.*/
    if (!securityDevice) return null;
    /*Если пользовательская сессия и пользовательское устройство были найдены, то просим репозиторий "UsersRepository"
    найти пользователя по ID в БД.*/
    return await this.usersRepository.findById(userId);
  }
}
