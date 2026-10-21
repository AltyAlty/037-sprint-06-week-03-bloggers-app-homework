import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Argon2Adapter } from '../../../../../core/security/cryptography/argon2.adapter';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { UserOutputDTO } from '../../../api/users/output-dto/user.output-dto';
import { normalizeEmail } from '../../../../../core/utils/email/normalize-email.util';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { User } from '../../../domain/users/users.entity';
import { CreateConfirmedUserCommand } from './create-confirmed-user.command';

/*Обработчик команды для создания подтвержденного пользователя.*/
@CommandHandler(CreateConfirmedUserCommand)
export class CreateConfirmedUserCommandHandler implements ICommandHandler<CreateConfirmedUserCommand> {
  public constructor(
    private readonly argon2Adapter: Argon2Adapter,
    private readonly usersRepository: UsersRepository
  ) {}

  public async execute({ dto }: CreateConfirmedUserCommand): Promise<UserOutputDTO> {
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
    user = User.create({ login, originalEmail: email, email: normalizeEmail(email), passwordHash, isConfirmed: true });
    /*Просим репозиторий "UsersRepository" сохранить пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Преобразовываем пользователя из БД в подготовленного для отправки клиенту пользователя и возвращаем его.*/
    return UserOutputDTO.mapFromUserToUserOutputDTO(user);
  }
}
