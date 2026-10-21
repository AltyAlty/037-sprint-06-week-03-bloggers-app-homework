import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCommentForPostInputDTO } from './input-dto/create-comment-for-post.input-dto';
import { GetCommentListByPostIdQueryInputDTO } from './input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { GetPostListQueryInputDTO } from './input-dto/query/get-post-list-query.input-dto';
import { UpdatePostLikeStatusByIdInputDTO } from './input-dto/update-post-like-status-by-id.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { CommentListOutputDTO, CommentOutputDTO } from '../comments/output-dto/comment.output-dto';
import { PostListOutputDTO, PostOutputDTO } from './output-dto/post.output-dto';
import { AccessJwtAuthGuard } from '../../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { OptionalAccessJwtAuthGuard } from '../../../../core/guards/optional-access-jwt-auth/optional-access-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { PostsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/posts-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';
import { CreateCommentForPostCommand } from '../../application/comments/commands/create-comment-for-post.command';
import { GetCommentListByPostIdQuery } from '../../application/comments/queries/get-comment-list-by-post-id.query';
import { UpdatePostLikeStatusByIdCommand } from '../../application/posts/commands/update-post-like-status-by-id.command';
import { GetPostByIdQuery } from '../../application/posts/queries/get-post-by-id.query';
import { GetPostListQuery } from '../../application/posts/queries/get-post-list.query';

/*Контроллер для постов.*/
@ApiTags(SETTINGS.POSTS_API_TAG)
@ApiBearerAuth()
@Controller(SETTINGS.POSTS_PREFIX)
export class PostsController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. POST-запрос по созданию комментария в посте по ID поста, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.createCommentForPost
  @UseGuards(AccessJwtAuthGuard)
  @Post(SETTINGS.POSTS_CREATE_COMMENT_FOR_POST_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createCommentForPost(
    @Param('id') id: string,
    @Body() body: CreateCommentForPostInputDTO,
    @ExtractUserDataFromRequest() userJwtAccessAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<CommentOutputDTO> {
    /*Просим шину "CommandBus" создать комментарий в посте.*/
    return this.commandBus.execute(new CreateCommentForPostCommand({ postId: id, ...body }, userJwtAccessAuthContext));
  }

  /*002. GET-запрос по поиску поста по ID, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.getPostById
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.POSTS_GET_POST_BY_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostById(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PostOutputDTO> {
    /*Просим шину "QueryBus" найти пост по ID.*/
    return this.queryBus.execute(new GetPostByIdQuery(id, userAccessJwtAuthContext?.id));
  }

  /*003. GET-запрос по поиску постов с пагинацией, используя query-параметры.*/
  @PostsControllerSwaggerDecorators.getPostList
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.POSTS_GET_POST_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getPostList(
    @Query() query: GetPostListQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<PostListOutputDTO>> {
    /*Просим шину "QueryBus" найти посты.*/
    return this.queryBus.execute(new GetPostListQuery(query, userAccessJwtAuthContext?.id));
  }

  /*004. GET-запрос по поиску комментариев с пагинацией по ID поста, используя query-параметры.*/
  @PostsControllerSwaggerDecorators.getCommentListByPostId
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.POSTS_GET_COMMENT_LIST_BY_POST_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getCommentListByPostId(
    @Param('id') id: string,
    @Query() query: GetCommentListByPostIdQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<CommentListOutputDTO>> {
    /*Просим шину "QueryBus" найти комментарии по ID поста.*/
    return this.queryBus.execute(new GetCommentListByPostIdQuery(id, query, userAccessJwtAuthContext?.id));
  }

  /*005. PUT-запрос по изменению статуса лайка поста по ID поста, используя URI-параметры.*/
  @PostsControllerSwaggerDecorators.updatePostLikeStatusById
  @UseGuards(AccessJwtAuthGuard)
  @Put(SETTINGS.POSTS_UPDATE_POST_LIKE_STATUS_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updatePostLikeStatusById(
    @Param('id') id: string,
    @Body() body: UpdatePostLikeStatusByIdInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" изменить статус лайка поста по ID поста.*/
    await this.commandBus.execute(new UpdatePostLikeStatusByIdCommand({ id, ...body }, userAccessJwtAuthContext));
  }
}
