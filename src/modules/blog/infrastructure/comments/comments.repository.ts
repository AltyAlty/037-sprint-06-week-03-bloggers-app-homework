import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';

/*Репозиторий для комментариев в PostgreSQL.*/
@Injectable()
export class CommentsRepository {
  public constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeData) private readonly commentLikesDataRepository: Repository<CommentLikeData>
  ) {}

  /*Метод для сохранения комментария в БД.*/
  public async save(comment: Comment): Promise<void> {
    await this.commentsRepository
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values(comment)
      .orUpdate(['content'], ['id'])
      .execute();
  }

  /*Метод для сохранения данных о лайке комментария в БД.*/
  public async saveCommentLikeData(commentLikeData: CommentLikeData): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .insert()
      .into(CommentLikeData)
      .values(commentLikeData)
      .orUpdate(['like_status', 'added_at'], ['id'])
      .execute();
  }

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<Comment | null> {
    return await this.commentsRepository.createQueryBuilder('comment').where('comment.id = :id', { id }).getOne();
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeData | null> {
    return await this.commentLikesDataRepository
      .createQueryBuilder('commentLikeData')
      .where('commentLikeData.commentId = :commentId', { commentId })
      .andWhere('commentLikeData.userId = :userId', { userId })
      .getOne();
  }

  /*Метод для soft удаления комментария по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().softDelete().where('id = :id', { id }).execute();
  }

  /*Метод для hard удаления комментария по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }

  /*Метод для soft удаления комментариев по ID поста в БД.*/
  public async markAllAsDeletedByPostId(postId: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().softDelete().where('postId = :postId', { postId }).execute();
  }

  /*Метод для hard удаления комментариев по ID поста в БД.*/
  public async deleteAllByPostId(postId: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().delete().where('postId = :postId', { postId }).execute();
  }

  /*Метод для soft удаления комментариев по ID блога в БД.*/
  public async markAllAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().softDelete().where('blogId = :blogId', { blogId }).execute();
  }

  /*Метод для hard удаления комментариев по ID блога в БД.*/
  public async deleteAllByBlogId(blogId: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().delete().where('blogId = :blogId', { blogId }).execute();
  }

  /*Метод для soft удаления комментариев по ID пользователя в БД.*/
  public async markAllAsDeletedByUserId(userId: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().softDelete().where('userId = :userId', { userId }).execute();
  }

  /*Метод для hard удаления комментариев по ID пользователя в БД.*/
  public async deleteAllByUserId(userId: string): Promise<void> {
    await this.commentsRepository.createQueryBuilder().delete().where('userId = :userId', { userId }).execute();
  }

  /*Метод для soft удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async markCommentLikeDataAsDeletedByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('commentId = :commentId', { commentId })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  /*Метод для hard удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async deleteCommentLikeDataByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .delete()
      .where('commentId = :commentId', { commentId })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  /*Метод для soft удаления данных о лайках комментария по ID комментария в БД.*/
  public async markAllCommentLikeDataAsDeletedByCommentId(commentId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('commentId = :commentId', { commentId })
      .execute();
  }

  /*Метод для hard удаления данных о лайках комментария по ID комментария в БД.*/
  public async deleteAllCommentLikeDataByCommentId(commentId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .delete()
      .where('commentId = :commentId', { commentId })
      .execute();
  }

  /*Метод для soft удаления данных о лайках комментариев по ID поста в БД.*/
  public async markAllCommentLikeDataAsDeletedByPostId(postId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('postId = :postId', { postId })
      .execute();
  }

  /*Метод для hard удаления данных о лайках комментариев по ID поста в БД.*/
  public async deleteAllCommentLikeDataByPostId(postId: string): Promise<void> {
    await this.commentLikesDataRepository.createQueryBuilder().delete().where('postId = :postId', { postId }).execute();
  }

  /*Метод для soft удаления данных о лайках комментария по ID блога в БД.*/
  public async markAllCommentLikeDataAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('blogId = :blogId', { blogId })
      .execute();
  }

  /*Метод для hard удаления данных о лайках комментария по ID блога в БД.*/
  public async deleteAllCommentLikeDataByBlogId(blogId: string): Promise<void> {
    await this.commentLikesDataRepository.createQueryBuilder().delete().where('blogId = :blogId', { blogId }).execute();
  }

  /*Метод для soft удаления данных о лайках комментария по ID пользователя в БД.*/
  public async markAllCommentLikeDataAsDeletedByUserId(userId: string): Promise<void> {
    await this.commentLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('userId = :userId', { userId })
      .execute();
  }

  /*Метод для hard удаления данных о лайках комментария по ID пользователя в БД.*/
  public async deleteAllCommentLikeDataByUserId(userId: string): Promise<void> {
    await this.commentLikesDataRepository.createQueryBuilder().delete().where('userId = :userId', { userId }).execute();
  }
}
