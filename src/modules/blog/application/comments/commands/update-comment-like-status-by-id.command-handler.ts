import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { CommentLikeStatusInputDTO } from '../../../api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Comment } from '../../../domain/comments/comment.entity';
import { CommentLikeData } from '../../../domain/comments/comment-like-data.entity';
import { CommentLikeStatusDomainDTO } from '../../../domain/comments/domain-dto/comment-like-status.domain-dto';
import { UpdateCommentLikeStatusByIdCommand } from './update-comment-like-status-by-id.command';

/*Обработчик команды для изменения статуса лайка комментария по ID комментария.*/
@CommandHandler(UpdateCommentLikeStatusByIdCommand)
export class UpdateCommentLikeStatusByIdCommandHandler implements ICommandHandler<UpdateCommentLikeStatusByIdCommand> {
  public constructor(private readonly commentsRepository: CommentsRepository) {}

  public async execute({ dto, userAccessJwtAuthContext }: UpdateCommentLikeStatusByIdCommand): Promise<void> {
    /*Получаем ID комментария.*/
    const commentId: string = dto.id;
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(commentId);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdatingLikeStatus,
        message: 'Comment to update like status not found',
        field: 'id',
      });

    /*Получаем ID блога, в котором находится комментарий.*/
    const blogId: string = comment.blogId;
    /*Получаем ID поста, в котором находится комментарий.*/
    const postId: string = comment.postId;
    /*Получаем ID пользователя.*/
    const userId: string = userAccessJwtAuthContext.id;
    /*Получаем статус лайка комментария.*/
    const likeStatus: CommentLikeStatusInputDTO = dto.likeStatus;

    /*Если комментарий был найден, то просим репозиторий "CommentsRepository" найти данные о лайке для комментария по ID
    комментария и ID пользователя в БД.*/
    let commentLikeData: CommentLikeData | null = await this.commentsRepository.findCommentLikeDataByCommentIdAndUserId(
      commentId,
      userId
    );

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (commentLikeData && commentLikeData.likeStatus === (likeStatus as unknown as CommentLikeStatusDomainDTO)) ||
      (!commentLikeData && likeStatus === CommentLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.None) {
      /*Просим репозиторий "CommentsRepository" hard удалить данные о лайке комментария по ID комментария и ID
      пользователя в БД.*/
      await this.commentsRepository.deleteCommentLikeDataByCommentIdAndUserId(commentId, userId);

      /*Изменяем количество лайков и дизлайков у комментария:
      1. Если уже стоял лайк, то уменьшаем количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшаем количество дизлайков на 1.*/
      if (commentLikeData?.likeStatus === CommentLikeStatusDomainDTO.Like) {
        comment.updateLikesCount({ likesCount: -1, dislikesCount: 0 });
      } else {
        comment.updateLikesCount({ likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк.*/
      if (!commentLikeData) {
        /*Просим сущность "CommentLikeData" создать данные о лайке комментария.*/
        commentLikeData = CommentLikeData.create({
          blogId,
          postId,
          commentId,
          userId,
          likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у комментария:
        1. Увеличиваем количество лайков на 1.
        2. Не меняем количество дизлайков.*/
        comment.updateLikesCount({ likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (commentLikeData.likeStatus === CommentLikeStatusDomainDTO.Dislike) {
        /*Изменяем статус лайка комментария.*/
        commentLikeData.update({ likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у комментария:
        1. Увеличиваем количество лайков на 1.
        2. Уменьшаем количество дизлайков на 1.*/
        comment.updateLikesCount({ likesCount: 1, dislikesCount: -1 });
      }

      /*Просим репозиторий "commentsRepository" сохранить измененные данные о лайке комментария в БД.*/
      await this.commentsRepository.saveCommentLikeData(commentLikeData);
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен дизлайк.*/
      if (!commentLikeData) {
        /*Просим сущность "CommentLikeData" создать данные о лайке комментария.*/
        commentLikeData = CommentLikeData.create({
          blogId,
          postId,
          commentId,
          userId,
          likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у комментария:
        1. Не меняем количество лайков.
        2. Увеличиваем количество дизлайков на 1.*/
        comment.updateLikesCount({ likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (commentLikeData?.likeStatus === CommentLikeStatusDomainDTO.Like) {
        /*Изменяем статус лайка комментария.*/
        commentLikeData.update({ likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у комментария:
        1. Уменьшаем количество лайков на 1.
        2. Увеличиваем количество дизлайков на 1.*/
        comment.updateLikesCount({ likesCount: -1, dislikesCount: 1 });
      }

      /*Просим репозиторий "commentsRepository" сохранить измененные данные о лайке комментария в БД.*/
      await this.commentsRepository.saveCommentLikeData(commentLikeData);
    }

    /*Просим репозиторий "commentsRepository" сохранить измененный комментарий в БД.*/
    await this.commentsRepository.save(comment);
  }
}
