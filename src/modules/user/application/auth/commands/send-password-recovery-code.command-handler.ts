import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { AuthRepository } from '../../../infrastructure/auth/auth.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { AuthConfig } from '../../../config/auth.config';
import { PasswordRecoveryCodeData } from '../../../domain/auth/password-recovery-code-data.entity';
import { User } from '../../../domain/users/users.entity';
import { PasswordRecoveryRequestedEvent } from '../events/password-recovery-requested.event';
import { SendPasswordRecoveryCodeCommand } from './send-password-recovery-code.command';

/*Обработчик команды для отправки письма с кодом восстановления пароля пользователя.*/
@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeCommandHandler implements ICommandHandler<SendPasswordRecoveryCodeCommand> {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus
  ) {}

  public async execute({ dto }: SendPasswordRecoveryCodeCommand): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    const user: User | null = await this.usersRepository.findByEmail(dto.email);
    /*Если пользователь не был найден, то завершаем работу метода, чтобы не возвращать ошибку клиенту.*/
    if (!user) return;
    /*Если пользователь был найден, то получаем ID пользователя.*/
    const userId: string = user.id;
    /*Генерируем код восстановления пароля пользователя.*/
    const passwordRecoveryCode: string = randomUUID();

    /*Генерируем дату истечения кода восстановления пароля пользователя.*/
    const expirationDate: Date = add(new Date(), {
      minutes: this.authConfig.PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_MINUTES,
    });

    /*Просим репозиторий "AuthRepository" найти данные о коде восстановления пароля пользователя по ID пользователя в
    БД.*/
    let passwordRecoveryCodeData: PasswordRecoveryCodeData | null =
      await this.authRepository.findRecoveryPasswordCodeDataByUserId(userId);

    /*Если данные о коде восстановления пароля пользователя были найдены, то изменяем их, иначе создаем их.*/
    if (passwordRecoveryCodeData) {
      passwordRecoveryCodeData.update({ passwordRecoveryCode, expirationDate });
    } else {
      passwordRecoveryCodeData = PasswordRecoveryCodeData.create({ userId, passwordRecoveryCode, expirationDate });
    }

    /*Просим репозиторий "AuthRepository" сохранить данные о коде восстановления пароля пользователя в БД.*/
    await this.authRepository.savePasswordRecoveryCodeData(passwordRecoveryCodeData);
    /*Просим шину "EventBus" отправить письмо с кодом восстановления пароля пользователя.*/
    this.eventBus.publish(new PasswordRecoveryRequestedEvent(dto.email, passwordRecoveryCode));
  }
}
