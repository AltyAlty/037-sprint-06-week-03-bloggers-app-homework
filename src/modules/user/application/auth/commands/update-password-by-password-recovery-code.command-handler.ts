import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Argon2Adapter } from '../../../../../core/security/cryptography/argon2.adapter';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { PasswordRecoveryCodeData } from '../../../domain/auth/password-recovery-code-data.entity';
import { User } from '../../../domain/users/users.entity';
import { UpdatePasswordByPasswordRecoveryCodeCommand } from './update-password-by-password-recovery-code.command';

/*Обработчик команды для изменения пароля пользователя по коду восстановления пароля пользователя.*/
@CommandHandler(UpdatePasswordByPasswordRecoveryCodeCommand)
export class UpdatePasswordByPasswordRecoveryCodeCommandHandler implements ICommandHandler<UpdatePasswordByPasswordRecoveryCodeCommand> {
  public constructor(
    private readonly argon2Adapter: Argon2Adapter,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  public async execute({ dto }: UpdatePasswordByPasswordRecoveryCodeCommand): Promise<void> {
    /*Просим репозиторий "AuthRepository" найти данные о коде восстановления пароля пользователя по коду восстановления
     пароля пользователя в БД.*/
    const passwordRecoveryCodeData: PasswordRecoveryCodeData | null =
      await this.authRepository.findRecoveryPasswordCodeDataByPasswordRecoveryCode(dto.recoveryCode);

    /*Если данные о коде восстановления пароля пользователя не были найдены, то выбрасываем исключение с информацией об
    этом.*/
    if (!passwordRecoveryCodeData)
      throw new DomainException({
        code: DomainExceptionCode.InvalidPasswordRecoveryCode,
        message: 'Password recovery code is invalid',
        field: 'recoveryCode',
      });

    /*Если срок действия кода восстановления пароля пользователя истек, то выбрасываем исключение с информацией об
    этом.*/
    if (passwordRecoveryCodeData.expirationDate <= new Date())
      throw new DomainException({
        code: DomainExceptionCode.ExpiredPasswordRecoveryCode,
        message: 'Password recovery code is expired',
        field: 'recoveryCode',
      });

    /*Если данные о коде восстановления пароля пользователя были найдены, то получаем ID пользователя.*/
    const userId: string = passwordRecoveryCodeData.userId;
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersRepository.findById(userId);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhilePasswordRecovery,
        message: 'User to recover password not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим адаптер "Argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(dto.password);
    /*Изменяем хеш для пароля пользователя.*/
    user.updatePasswordHash(passwordHash);
    /*Просим репозиторий "UsersRepository" сохранить измененного пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Просим репозиторий "AuthRepository" hard удалить данные о всех кодах восстановления пароля пользователя ID
    пользователя в БД.*/
    await this.authRepository.deleteAllRecoveryCodesDataByUserId(userId);
  }
}
