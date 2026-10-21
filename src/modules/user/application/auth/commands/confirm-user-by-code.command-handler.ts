import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { EmailConfirmation } from '../../../domain/auth/email-confirmation.entity';
import { User } from '../../../domain/users/users.entity';
import { ConfirmUserByCodeCommand } from './confirm-user-by-code.command';

/*Обработчик команды для подтверждения регистрации пользователя по коду подтверждения регистрации пользователя.*/
@CommandHandler(ConfirmUserByCodeCommand)
export class ConfirmUserByCodeCommandHandler implements ICommandHandler<ConfirmUserByCodeCommand> {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  public async execute({ dto }: ConfirmUserByCodeCommand): Promise<void> {
    /*Просим репозиторий "AuthRepository" найти данные о подтверждении регистрации пользователя по коду подтверждения
    регистрации пользователя.*/
    const emailConfirmation: EmailConfirmation | null = await this.authRepository.findEmailConfirmationByCode(dto.code);

    /*Если данные о подтверждении регистрации пользователя не были найдены, то выбрасываем исключение с информацией об
    этом.*/
    if (!emailConfirmation)
      throw new DomainException({
        code: DomainExceptionCode.InvalidUserRegistrationConfirmationCode,
        message: 'Confirmation code is invalid',
        field: 'code',
      });

    /*Если срок действия кода подтверждения регистрации пользователя истек, то выбрасываем исключение с информацией об
    этом.*/
    if (emailConfirmation.expirationDate <= new Date())
      throw new DomainException({
        code: DomainExceptionCode.ExpiredUserRegistrationConfirmationCode,
        message: 'Confirmation code is expired',
        field: 'code',
      });

    /*Если данные о подтверждении регистрации пользователя были найдены и срок действия кода подтверждения регистрации
    пользователя не истек, то получаем ID пользователя.*/
    const userId: string = emailConfirmation.userId;
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersRepository.findById(userId);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileRegistrationConfirmation,
        message: 'User to confirm registration not found',
        field: 'id',
      });

    /*Если регистрация пользователя уже была подтверждена, то выбрасываем исключение с информацией об этом.*/
    if (user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.AlreadyConfirmedUserRegistration,
        message: 'Registration has already been confirmed',
        field: 'code',
      });

    /*Если пользователь был найден и его регистрация еще не была подтверждена, то подтверждаем регистрацию
    пользователя.*/
    user.confirm();
    /*Просим репозиторий "UsersRepository" сохранить измененного пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Просим репозиторий "AuthRepository" hard удалить все данные о подтверждении регистрации пользователя по ID
    пользователя в БД.*/
    await this.authRepository.deleteAllEmailConfirmationsByUserId(userId);
  }
}
