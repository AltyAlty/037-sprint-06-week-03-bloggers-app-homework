import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { PostLikeStatusInputDTO } from '../../../api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { PostLikeStatusDomainDTO } from '../../../domain/posts/domain-dto/post-like-status.domain-dto';
import { Post } from '../../../domain/posts/post.entity';
import { PostLikeData } from '../../../domain/posts/post-like-data.entity';
import { UpdatePostLikeStatusByIdCommand } from './update-post-like-status-by-id.command';

/*Обработчик команды для изменения статуса лайка поста по ID поста.*/
@CommandHandler(UpdatePostLikeStatusByIdCommand)
export class UpdatePostLikeStatusByIdCommandHandler implements ICommandHandler<UpdatePostLikeStatusByIdCommand> {
  public constructor(private readonly postsRepository: PostsRepository) {}

  public async execute({ dto, userAccessJwtAuthContext }: UpdatePostLikeStatusByIdCommand): Promise<void> {
    /*Получаем ID поста.*/
    const postId: string = dto.id;
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdatingLikeStatus,
        message: 'Post to update like status not found',
        field: 'id',
      });

    /*Получаем ID блога, в котором находится пост.*/
    const blogId: string = post.blogId;
    /*Получаем ID пользователя.*/
    const userId: string = userAccessJwtAuthContext.id;
    /*Получаем статус лайка поста.*/
    const likeStatus: PostLikeStatusInputDTO = dto.likeStatus;

    /*Если пост был найден, то просим репозиторий "PostsRepository" найти данные о лайке для поста по ID поста и ID
    пользователя в БД.*/
    let postLikeData: PostLikeData | null = await this.postsRepository.findPostLikeDataByPostIdAndUserId(
      postId,
      userId
    );

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (postLikeData && postLikeData.likeStatus === (likeStatus as unknown as PostLikeStatusDomainDTO)) ||
      (!postLikeData && likeStatus === PostLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (likeStatus === PostLikeStatusInputDTO.None) {
      /*Просим репозиторий "PostsRepository" hard удалить данные о лайке поста по ID поста и ID пользователя в БД.*/
      await this.postsRepository.deletePostLikeDataByPostIdAndUserId(postId, userId);

      /*Изменяем количество лайков и дизлайков у поста:
      1. Если уже стоял лайк, то уменьшаем количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшаем количество дизлайков на 1.*/
      if (postLikeData?.likeStatus === PostLikeStatusDomainDTO.Like) {
        post.updateLikesCount({ likesCount: -1, dislikesCount: 0 });
      } else {
        post.updateLikesCount({ likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (likeStatus === PostLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк.*/
      if (!postLikeData) {
        /*Просим сущность "PostLikeData" создать данные о лайке поста.*/
        postLikeData = PostLikeData.create({
          blogId,
          postId,
          userId,
          likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у поста:
        1. Увеличиваем количество лайков на 1.
        2. Не меняем количество дизлайков.*/
        post.updateLikesCount({ likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (postLikeData.likeStatus === PostLikeStatusDomainDTO.Dislike) {
        /*Изменяем статус лайка поста.*/
        postLikeData.update({ likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у поста:
        1. Увеличиваем количество лайков на 1.
        2. Уменьшаем количество дизлайков на 1.*/
        post.updateLikesCount({ likesCount: 1, dislikesCount: -1 });
      }

      /*Просим репозиторий "postsRepository" сохранить измененные данные о лайке поста в БД.*/
      await this.postsRepository.savePostLikeData(postLikeData);
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (likeStatus === PostLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!postLikeData) {
        /*Просим сущность "PostLikeData" создать данные о лайке поста.*/
        postLikeData = PostLikeData.create({
          blogId,
          postId,
          userId,
          likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у поста:
        1. Не меняем количество лайков.
        2. Увеличиваем количество дизлайков на 1.*/
        post.updateLikesCount({ likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (postLikeData?.likeStatus === PostLikeStatusDomainDTO.Like) {
        /*Изменяем статус лайка поста.*/
        postLikeData.update({ likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у поста:
        1. Уменьшаем количество лайков на 1.
        2. Увеличиваем количество дизлайков на 1.*/
        post.updateLikesCount({ likesCount: -1, dislikesCount: 1 });
      }

      /*Просим репозиторий "postsRepository" сохранить измененные данные о лайке поста в БД.*/
      await this.postsRepository.savePostLikeData(postLikeData);
    }

    /*Просим репозиторий "postsRepository" сохранить измененный пост в БД.*/
    await this.postsRepository.save(post);
  }
}
