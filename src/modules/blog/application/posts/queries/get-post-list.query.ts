import { Query } from '@nestjs/cqrs';
import { GetPostListQueryInputDTO } from '../../../api/posts/input-dto/query/get-post-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO } from '../../../api/posts/output-dto/post.output-dto';

/*Запрос для поиска постов.*/
export class GetPostListQuery extends Query<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
  public constructor(
    public readonly dto: GetPostListQueryInputDTO,
    public readonly userId?: string
  ) {
    super();
  }
}
