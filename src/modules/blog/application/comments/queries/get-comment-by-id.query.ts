import { Query } from '@nestjs/cqrs';
import { CommentOutputDTO } from '../../../api/comments/output-dto/comment.output-dto';

/*Запрос для поиска комментария по ID.*/
export class GetCommentByIdQuery extends Query<CommentOutputDTO> {
  public constructor(
    public readonly id: string,
    public readonly userId?: string
  ) {
    super();
  }
}
