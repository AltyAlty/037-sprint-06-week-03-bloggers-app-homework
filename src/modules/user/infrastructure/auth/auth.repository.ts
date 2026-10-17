import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmation } from '../../domain/auth/email-confirmation.entity';
import { PasswordRecoveryCodeData } from '../../domain/auth/password-recovery-code-data.entity';
import { Session } from '../../domain/auth/session.entity';

/*Репозиторий для работы с аутентификацией и авторизацией.*/
@Injectable()
export class AuthRepository {
  public constructor(
    @InjectRepository(EmailConfirmation) private readonly emailConfirmationsRepository: Repository<EmailConfirmation>,
    @InjectRepository(PasswordRecoveryCodeData)
    private readonly passwordRecoveryCodesDataRepository: Repository<PasswordRecoveryCodeData>,
    @InjectRepository(Session) private readonly sessionsRepository: Repository<Session>
  ) {}

  /*Метод для сохранения данных о подтверждении регистрации пользователя в БД.*/
  public async saveEmailConfirmation(emailConfirmation: EmailConfirmation): Promise<void> {
    await this.emailConfirmationsRepository
      .createQueryBuilder()
      .insert()
      .into(EmailConfirmation)
      .values(emailConfirmation)
      .orUpdate(['confirmation_code', 'expiration_date'], ['id'])
      .execute();
  }

  /*Метод для сохранения данных о коде восстановления пароля пользователя в БД.*/
  public async savePasswordRecoveryCodeData(passwordRecoveryCodeData: PasswordRecoveryCodeData): Promise<void> {
    await this.passwordRecoveryCodesDataRepository
      .createQueryBuilder()
      .insert()
      .into(PasswordRecoveryCodeData)
      .values(passwordRecoveryCodeData)
      .orUpdate(['password_recovery_code', 'expiration_date'], ['id'])
      .execute();
  }

  /*Метод для сохранения пользовательской сессии в БД.*/
  public async saveSession(session: Session): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder()
      .insert()
      .into(Session)
      .values(session)
      .orUpdate(['iat', 'exp'], ['id'])
      .execute();
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async findEmailConfirmationByUserId(userId: string): Promise<EmailConfirmation | null> {
    return await this.emailConfirmationsRepository
      .createQueryBuilder('emailConfirmation')
      .where('emailConfirmation.userId = :userId', { userId })
      .getOne();
  }

  /*Метод для поиска данных о подтверждении регистрации пользователя по коду подтверждения регистрации пользователя в
  БД.*/
  public async findEmailConfirmationByCode(confirmationCode: string): Promise<EmailConfirmation | null> {
    return await this.emailConfirmationsRepository
      .createQueryBuilder('emailConfirmation')
      .where('emailConfirmation.confirmationCode = :confirmationCode', { confirmationCode })
      .getOne();
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по ID пользователя в БД.*/
  public async findRecoveryPasswordCodeDataByUserId(userId: string): Promise<PasswordRecoveryCodeData | null> {
    return await this.passwordRecoveryCodesDataRepository
      .createQueryBuilder('passwordRecoveryCodeData')
      .where('passwordRecoveryCodeData.userId = :userId', { userId })
      .getOne();
  }

  /*Метод для поиска данных о коде восстановления пароля пользователя по коду восстановления пароля пользователя в БД.*/
  public async findRecoveryPasswordCodeDataByPasswordRecoveryCode(
    passwordRecoveryCode: string
  ): Promise<PasswordRecoveryCodeData | null> {
    return await this.passwordRecoveryCodesDataRepository
      .createQueryBuilder('passwordRecoveryCodeData')
      .where('passwordRecoveryCodeData.passwordRecoveryCode = :passwordRecoveryCode', { passwordRecoveryCode })
      .getOne();
  }

  /*Метод для поиска пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT в
  БД.*/
  public async findSessionByUserIdAndDeviceIdAndIat(
    userId: string,
    deviceId: string,
    iat: Date
  ): Promise<Session | null> {
    return await this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.deviceId = :deviceId', { deviceId })
      .andWhere('session.iat = :iat', { iat })
      .getOne();
  }

  /*Метод для hard удаления всех данных о подтверждении регистрации пользователя по ID пользователя в БД.*/
  public async deleteAllEmailConfirmationsByUserId(userId: string): Promise<void> {
    await this.emailConfirmationsRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .execute();
  }

  /*Метод для hard удаления данных о всех кодах восстановления пароля пользователя по ID пользователя в БД.*/
  public async deleteAllRecoveryCodesDataByUserId(userId: string): Promise<void> {
    await this.passwordRecoveryCodesDataRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .execute();
  }

  /*Метод для hard удаления пользовательской сессии по ID пользователя, ID пользовательского устройства и дате выдачи RT
  в БД.*/
  public async deleteSessionByUserIdAndDeviceIdAndIat(userId: string, deviceId: string, iat: Date): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId = :deviceId', { deviceId })
      .andWhere('iat = :iat', { iat })
      .execute();
  }

  /*Метод для hard удаления пользовательской сессии по ID пользователя и ID пользовательского устройства в БД.*/
  public async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId = :deviceId', { deviceId })
      .execute();
  }

  /*Метод для hard удаления всех пользовательских сессий по ID пользователя и ID пользовательского устройства в БД.*/
  public async deleteAllSessionsExceptCurrentOneByUserIdAndSecurityDeviceId(
    userId: string,
    deviceId: string
  ): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId })
      .execute();
  }
}
