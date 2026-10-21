import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../infrastructure/blogs/blogs.query-repository';
import { PostsQueryRepository } from '../../../infrastructure/posts/posts.query-repository';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO, PostOutputDTO } from '../../../api/posts/output-dto/post.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { PostList } from '../../../domain/posts/post.entity';
import { GetPostListByBlogIdQuery } from './get-post-list-by-blog-id.query';

/*Обработчик запроса для поиска постов по ID блога.*/
@QueryHandler(GetPostListByBlogIdQuery)
export class GetPostListByBlogIdQueryHandler implements IQueryHandler<GetPostListByBlogIdQuery> {
  public constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

  public async execute({
    dto,
    blogId,
    userId,
  }: GetPostListByBlogIdQuery): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим query-репозиторий "BlogsQueryRepository" найти блог по ID.*/
    const blog: Blog | null = await this.blogsQueryRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostSearching,
        message: 'Blog to find posts not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим query-репозиторий "PostsQueryRepository" найти посты в БД.*/
    const { items, totalCount }: { items: PostList; totalCount: number } = await this.postsQueryRepository.findAll(
      dto,
      blogId
    );

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
