import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { AuthConfig } from '../../../config/auth.config';
import { EmailConfirmation } from '../../../domain/auth/email-confirmation.entity';
import { User } from '../../../domain/users/users.entity';
import { ResendingConfirmationEmailRequestedEvent } from '../events/resending-confirmation-email-requested.event';
import { ResendConfirmationEmailCommand } from './resend-confirmation-email.command';

/*Обработчик команды для повторной отправки письма для подтверждения регистрации пользователя.*/
@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailCommandHandler implements ICommandHandler<ResendConfirmationEmailCommand> {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus
  ) {}

  public async execute({ dto }: ResendConfirmationEmailCommand): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    const user: User | null = await this.usersRepository.findByEmail(dto.email);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileResendingConfirmationEmail,
        message: 'User to confirm not found',
        field: 'email',
      });

    /*Если регистрация пользователя уже была подтверждена, то выбрасываем исключение с информацией об этом.*/
    if (user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.AlreadyConfirmedUserRegistration,
        message: 'Registration has already been confirmed',
        field: 'email',
      });

    /*Получаем ID пользователя.*/
    const userId: string = user.id;
    /*Если регистрация пользователя еще не была подтверждена, то генерируем код подтверждения регистрации
    пользователя.*/
    const confirmationCode: string = randomUUID();

    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const expirationDate: Date = add(new Date(), {
      minutes: this.authConfig.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES,
    });

    /*Просим репозиторий "AuthRepository" найти данные о подтверждении регистрации пользователя по ID пользователя в
    БД.*/
    let emailConfirmation: EmailConfirmation | null = await this.authRepository.findEmailConfirmationByUserId(userId);

    /*Если данные о подтверждении регистрации пользователя были найдены, то просим репозиторий "AuthRepository" изменить
    их по ID пользователя в БД.*/
    if (emailConfirmation) {
      emailConfirmation.update({ confirmationCode, expirationDate });
    } else {
      /*Если данные о подтверждении регистрации пользователя не были найдены, то создаем такие данные и просим
      репозиторий "AuthRepository" сохранить их в БД.*/
      emailConfirmation = EmailConfirmation.create({ userId, confirmationCode, expirationDate });
      await this.authRepository.saveEmailConfirmation(emailConfirmation);
    }

    /*Просим шину "EventBus" повторно отправить письмо о подтверждении регистрации пользователя.*/
    this.eventBus.publish(new ResendingConfirmationEmailRequestedEvent(dto.email, confirmationCode));
  }
}
