import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateCommentByIdInputDTO } from './input-dto/update-comment-by-id.input-dto';
import { UpdateCommentLikeStatusByIdInputDTO } from './input-dto/update-comment-like-status-by-id.input-dto';
import { CommentOutputDTO } from './output-dto/comment.output-dto';
import { AccessJwtAuthGuard } from '../../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { OptionalAccessJwtAuthGuard } from '../../../../core/guards/optional-access-jwt-auth/optional-access-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { CommentsControllerSwaggerDecorators } from '../../../../core/swagger/decorators/blog-module/comments-controller.swagger-decorators';
import { ExtractUserDataFromRequest } from '../../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';
import { MarkCommentAsDeletedByIdCommand } from '../../application/comments/commands/mark-comment-as-deleted-by-id.command';
import { UpdateCommentByIdCommand } from '../../application/comments/commands/update-comment-by-id.command';
import { UpdateCommentLikeStatusByIdCommand } from '../../application/comments/commands/update-comment-like-status-by-id.command';
import { GetCommentByIdQuery } from '../../application/comments/queries/get-comment-by-id.query';

/*Контроллер для комментариев.*/
@ApiTags(SETTINGS.COMMENTS_API_TAG)
@ApiBearerAuth()
@Controller(SETTINGS.COMMENTS_PREFIX)
export class CommentsController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. GET-запрос по поиску комментария по ID, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.getCommentById
  @UseGuards(OptionalAccessJwtAuthGuard)
  @Get(SETTINGS.COMMENTS_GET_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getCommentById(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<CommentOutputDTO> {
    /*Просим шину "QueryBus" найти комментарий по ID.*/
    return this.queryBus.execute(new GetCommentByIdQuery(id, userAccessJwtAuthContext?.id));
  }

  /*002. PUT-запрос по изменению комментария по ID, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.updateCommentById
  @UseGuards(AccessJwtAuthGuard)
  @Put(SETTINGS.COMMENTS_UPDATE_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateCommentById(
    @Param('id') id: string,
    @Body() body: UpdateCommentByIdInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" изменить комментарий по ID поста.*/
    await this.commandBus.execute(new UpdateCommentByIdCommand({ id, ...body }, userAccessJwtAuthContext));
  }

  /*003. PUT-запрос по изменению статуса лайка комментария по ID комментария, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.updateCommentLikeStatusById
  @UseGuards(AccessJwtAuthGuard)
  @Put(SETTINGS.COMMENTS_UPDATE_COMMENT_LIKE_STATUS_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateCommentLikeStatusById(
    @Param('id') id: string,
    @Body() body: UpdateCommentLikeStatusByIdInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" изменить статус лайка комментария по ID комментария.*/
    await this.commandBus.execute(new UpdateCommentLikeStatusByIdCommand({ id, ...body }, userAccessJwtAuthContext));
  }

  /*004. DELETE-запрос по удалению комментария по ID, используя URI-параметры.*/
  @CommentsControllerSwaggerDecorators.deleteCommentById
  @UseGuards(AccessJwtAuthGuard)
  @Delete(SETTINGS.COMMENTS_DELETE_COMMENT_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteCommentById(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" soft удалить комментарий по ID.*/
    await this.commandBus.execute(new MarkCommentAsDeletedByIdCommand(id, userAccessJwtAuthContext));
  }
}
