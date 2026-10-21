import { Command } from '@nestjs/cqrs';
import { BlogOutputDTO } from '../../../api/blogs/output-dto/blog.output-dto';
import { CreateBlogDTO } from './dto/create-blog.dto';

/*Команда для создания блога.*/
export class CreateBlogCommand extends Command<BlogOutputDTO> {
  public constructor(public readonly dto: CreateBlogDTO) {
    super();
  }
}
