import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { Argon2Adapter } from '../../../../../core/security/cryptography/argon2.adapter';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { normalizeEmail } from '../../../../../core/utils/email/normalize-email.util';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { AuthConfig } from '../../../config/auth.config';
import { EmailConfirmation } from '../../../domain/auth/email-confirmation.entity';
import { User } from '../../../domain/users/users.entity';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { RegisterUserCommand } from './register-user.command';

/*Обработчик команды для регистрации пользователя.*/
@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly argon2Adapter: Argon2Adapter,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus
  ) {}

  public async execute({ dto }: RegisterUserCommand): Promise<void> {
    /*Получаем логин пользователя.*/
    const login: string = dto.login;
    /*Получаем email пользователя.*/
    const email: string = dto.email;
    /*Просим репозиторий "UsersRepository" найти пользователя по логину в БД.*/
    let user: User | null = await this.usersRepository.findByLogin(login);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueLoginToCreateUser,
        message: 'Login must be unique',
        field: 'login',
      });

    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    user = await this.usersRepository.findByEmail(email);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueEmailToCreateUser,
        message: 'Email must be unique',
        field: 'email',
      });

    /*Если пользователь еще не был создан, то просим адаптер "Argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(dto.password);
    /*Просим сущность "User" создать пользователя.*/
    user = User.create({ login, originalEmail: email, email: normalizeEmail(email), passwordHash, isConfirmed: false });
    /*Просим репозиторий "UsersRepository" сохранить пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Генерируем код подтверждения регистрации пользователя.*/
    const confirmationCode: string = randomUUID();

    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const expirationDate: Date = add(new Date(), {
      minutes: this.authConfig.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES,
    });

    /*Просим сущность "EmailConfirmation" создать данные о подтверждении регистрации пользователя.*/
    const emailConfirmation: EmailConfirmation = EmailConfirmation.create({
      userId: user.id,
      confirmationCode,
      expirationDate,
    });

    /*Просим репозиторий "AuthRepository" сохранить данные о подтверждении регистрации пользователя в БД*/
    await this.authRepository.saveEmailConfirmation(emailConfirmation);
    /*Просим шину "EventBus" отправить письмо о подтверждении регистрации пользователя.*/
    this.eventBus.publish(new UserRegisteredEvent(dto.email, confirmationCode));
  }
}
