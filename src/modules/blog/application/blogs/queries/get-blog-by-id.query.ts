import { Query } from '@nestjs/cqrs';
import { BlogOutputDTO } from '../../../api/blogs/output-dto/blog.output-dto';

/*Запрос для поиска блога по ID.*/
export class GetBlogByIdQuery extends Query<BlogOutputDTO> {
  public constructor(public readonly id: string) {
    super();
  }
}
