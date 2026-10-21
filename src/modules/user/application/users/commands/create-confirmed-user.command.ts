import { Command } from '@nestjs/cqrs';
import { UserOutputDTO } from '../../../api/users/output-dto/user.output-dto';
import { CreateConfirmedUserDTO } from './dto/create-confirmed-user.dto';

/*Команда для создания подтвержденного пользователя.*/
export class CreateConfirmedUserCommand extends Command<UserOutputDTO> {
  public constructor(public readonly dto: CreateConfirmedUserDTO) {
    super();
  }
}
