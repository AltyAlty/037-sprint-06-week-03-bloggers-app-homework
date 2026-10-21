import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../../infrastructure/posts/posts.query-repository';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO, PostOutputDTO } from '../../../api/posts/output-dto/post.output-dto';
import { PostList } from '../../../domain/posts/post.entity';
import { GetPostListQuery } from './get-post-list.query';

/*Обработчик запроса для поиска постов.*/
@QueryHandler(GetPostListQuery)
export class GetPostListQueryHandler implements IQueryHandler<GetPostListQuery> {
  public constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  public async execute({ dto, userId }: GetPostListQuery): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим query-репозиторий "PostsQueryRepository" найти посты в БД.*/
    const { items, totalCount }: { items: PostList; totalCount: number } = await this.postsQueryRepository.findAll(dto);

    /*Преобразовываем посты из БД в подготовленные для отправки клиенту посты.*/
    const postListOutput: PostListOutputDTO = await PostOutputDTO.mapFromPostListToPostListOutputDTO(
      items,
      this.postsQueryRepository,
      userId
    );

    /*Преобразовываем подготовленные для отправки клиенту посты в подготовленные для отправки клиенту с пагинацией
    посты и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: totalCount,
      items: postListOutput,
    });
  }
}
