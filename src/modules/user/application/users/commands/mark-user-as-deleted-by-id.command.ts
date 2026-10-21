import { Command } from '@nestjs/cqrs';

/*Команда для soft удаления пользователя по ID.*/
export class MarkUserAsDeletedByIdCommand extends Command<void> {
  public constructor(public readonly id: string) {
    super();
  }
}
