import { Command } from '@nestjs/cqrs';

/*Команда для soft удаления поста по ID блога и ID поста.*/
export class MarkPostAsDeletedByBlogIdAndPostIdCommand extends Command<void> {
  public constructor(
    public readonly id: string,
    public readonly blogId: string
  ) {
    super();
  }
}
