import { Query } from '@nestjs/cqrs';
import { GetCommentListByPostIdQueryInputDTO } from '../../../api/posts/input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { CommentListOutputDTO } from '../../../api/comments/output-dto/comment.output-dto';

/*Запрос для поиска комментариев по ID поста.*/
export class GetCommentListByPostIdQuery extends Query<PaginationMetaDataOutputDTO<CommentListOutputDTO>> {
  public constructor(
    public readonly postId: string,
    public readonly dto: GetCommentListByPostIdQueryInputDTO,
    public readonly userId?: string
  ) {
    super();
  }
}
