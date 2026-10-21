import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../infrastructure/blogs/blogs.query-repository';
import { BlogOutputDTO } from '../../../api/blogs/output-dto/blog.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { GetBlogByIdQuery } from './get-blog-by-id.query';

/*Обработчик запроса для поиска блога по ID.*/
@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  public constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute({ id }: GetBlogByIdQuery): Promise<BlogOutputDTO> {
    /*Просим query-репозиторий "BlogsQueryRepository" найти блог по ID в БД.*/
    const blog: Blog | null = await this.blogsQueryRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({ code: DomainExceptionCode.BlogNotFound, message: 'Blog not found', field: 'id' });

    /*Если блог был найден, то преобразовываем блог из БД в подготовленный для отправки клиенту блог и возвращаем его.*/
    return BlogOutputDTO.mapFromBlogToBlogOutputDTO(blog);
  }
}
