import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GetBlogListQueryInputDTO } from './input-dto/query/get-blog-list-query.input-dto';
import { GetPostListByBlogIdQueryInputDTO } from './input-dto/query/get-post-list-by-blog-id-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { PostListOutputDTO } from '../posts/output-dto/post.output-dto';
import { BlogListOutputDTO, BlogOutputDTO } from './output-dto/blog.output-dto';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { OptionalAccessJwtAuthGuard } from '../../../../core/guards/optional-access-jwt-auth/optional-access-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { BlogsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/blogs-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';
import { GetBlogByIdQuery } from '../../application/blogs/queries/get-blog-by-id.query';
import { GetBlogListQuery } from '../../application/blogs/queries/get-blog-list.query';
import { GetPostListByBlogIdQuery } from '../../application/posts/queries/get-post-list-by-blog-id.query';

/*Контроллер для блогов.*/
@ApiTags(SETTINGS.BLOGS_API_TAG)
@Controller(SETTINGS.BLOGS_PREFIX)
export class BlogsController {
  public constructor(private readonly queryBus: QueryBus) {}

  /*001. GET-запрос по поиску блога по ID, используя URI-параметры.*/
  @BlogsControllerSwaggerDecorators.getBlogById
  @Get(SETTINGS.BLOGS_GET_BLOG_BY_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getBlogById(@Param('id') id: string): Promise<BlogOutputDTO> {
    /*Просим шину "QueryBus" найти блог по ID.*/
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  /*002. GET-запрос по поиску блогов с пагинацией, используя query-параметры.*/
  @BlogsControllerSwaggerDecorators.getBlogList
  @Get(SETTINGS.BLOGS_GET_BLOG_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getBlogList(
    @Query() query: GetBlogListQueryInputDTO
  ): Promise<PaginationMetaDataOutputDTO<BlogListOutputDTO>> {
    /*Просим шину "QueryBus" найти блоги.*/
    return this.queryBus.execute(new GetBlogListQuery(query));
  }

  /*003. GET-запрос по поиску постов с пагинацией по ID блога, используя query-параметры.*/
  @BlogsControllerSwaggerDecorators.getPostListByBlogId
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.BLOGS_GET_POST_LIST_BY_BLOG_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostListByBlogId(
    @Param('id') id: string,
    @Query() query: GetPostListByBlogIdQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим шину "QueryBus" найти посты по ID блога.*/
    return this.queryBus.execute(new GetPostListByBlogIdQuery(query, id, userAccessJwtAuthContext?.id));
  }
}
