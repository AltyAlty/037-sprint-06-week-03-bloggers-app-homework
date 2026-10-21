import { Command } from '@nestjs/cqrs';
import { UpdatePostByBlogIdAndPostIdDTO } from './dto/update-post-by-blog-id-and-post-id.dto';

/*Команда для изменения поста по ID блога и ID поста.*/
export class UpdatePostByBlogIdAndPostIdCommand extends Command<void> {
  public constructor(public readonly dto: UpdatePostByBlogIdAndPostIdDTO) {
    super();
  }
}
