import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../infrastructure/blogs/blogs.query-repository';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { BlogListOutputDTO, BlogOutputDTO } from '../../../api/blogs/output-dto/blog.output-dto';
import { BlogList } from '../../../domain/blogs/blog.entity';
import { GetBlogListQuery } from './get-blog-list.query';

/*Обработчик запроса для поиска блогов.*/
@QueryHandler(GetBlogListQuery)
export class GetBlogListQueryHandler implements IQueryHandler<GetBlogListQuery> {
  public constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  public async execute({ dto }: GetBlogListQuery): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> {
    /*Просим query-репозиторий "BlogsQueryRepository" найти блоги в БД.*/
    const { items, totalCount }: { items: BlogList; totalCount: number } = await this.blogsQueryRepository.findAll(dto);

    /*Преобразовываем блоги из БД в подготовленные для отправки клиенту блоги.*/
    const blogListOutput: BlogListOutputDTO = BlogOutputDTO.mapFromBlogListToBlogListOutputDTO(items);

    /*Преобразовываем подготовленные для отправки клиенту блоги в подготовленные для отправки клиенту с пагинацией
    блоги и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount,
      items: blogListOutput,
    });
  }
}
