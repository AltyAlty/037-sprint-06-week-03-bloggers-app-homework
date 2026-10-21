import { Command } from '@nestjs/cqrs';
import { UpdateBlogByIdDTO } from './dto/update-blog-by-id.dto';

/*Команда для изменения блога по ID.*/
export class UpdateBlogByIdCommand extends Command<void> {
  public constructor(public readonly dto: UpdateBlogByIdDTO) {
    super();
  }
}
