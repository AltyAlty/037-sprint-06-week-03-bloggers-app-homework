import { Query } from '@nestjs/cqrs';
import { GetBlogListQueryInputDTO } from '../../../api/blogs/input-dto/query/get-blog-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogListOutputDTO } from '../../../api/blogs/output-dto/blog.output-dto';

/*Запрос для поиска блогов.*/
export class GetBlogListQuery extends Query<PaginationMetaDataOutputDTO<BlogListOutputDTO>> {
  public constructor(public readonly dto: GetBlogListQueryInputDTO) {
    super();
  }
}
