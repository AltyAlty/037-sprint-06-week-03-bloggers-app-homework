import { Query } from '@nestjs/cqrs';
import { PostOutputDTO } from '../../../api/posts/output-dto/post.output-dto';

/*Запрос для поиска поста по ID.*/
export class GetPostByIdQuery extends Query<PostOutputDTO> {
  public constructor(
    public readonly id: string,
    public readonly userId?: string
  ) {
    super();
  }
}
