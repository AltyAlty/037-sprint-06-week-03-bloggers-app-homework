import { Command } from '@nestjs/cqrs';

/*Команда для soft удаления блога по ID.*/
export class MarkBlogAsDeletedByIdCommand extends Command<void> {
  public constructor(public readonly id: string) {
    super();
  }
}
