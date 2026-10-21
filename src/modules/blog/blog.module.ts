import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsController } from './api/blogs/blogs.controller';
import { BlogsSaController } from './api/blogs/blogs-sa.controller';
import { CommentsController } from './api/comments/comments.controller';
import { PostsController } from './api/posts/posts.controller';
import { BlogsRepository } from './infrastructure/blogs/blogs.repository';
import { CommentsRepository } from './infrastructure/comments/comments.repository';
import { PostsRepository } from './infrastructure/posts/posts.repository';
import { BlogsQueryRepository } from './infrastructure/blogs/blogs.query-repository';
import { CommentsQueryRepository } from './infrastructure/comments/comments.query-repository';
import { PostsQueryRepository } from './infrastructure/posts/posts.query-repository';
import { UserModule } from '../user/user.module';
import { CreateBlogCommandHandler } from './application/blogs/commands/create-blog.command-handler';
import { MarkBlogAsDeletedByIdCommandHandler } from './application/blogs/commands/mark-blog-as-deleted-by-id.command-handler';
import { UpdateBlogByIdCommandHandler } from './application/blogs/commands/update-blog-by-id.command-handler';
import { GetBlogByIdQueryHandler } from './application/blogs/queries/get-blog-by-id.query-handler';
import { GetBlogListQueryHandler } from './application/blogs/queries/get-blog-list.query-handler';
import { CreateCommentForPostCommandHandler } from './application/comments/commands/create-comment-for-post.command-handler';
import { MarkCommentAsDeletedByIdCommandHandler } from './application/comments/commands/mark-comment-as-deleted-by-id.command-handler';
import { UpdateCommentByIdCommandHandler } from './application/comments/commands/update-comment-by-id.command-handler';
import { UpdateCommentLikeStatusByIdCommandHandler } from './application/comments/commands/update-comment-like-status-by-id.command-handler';
import { GetCommentByIdQueryHandler } from './application/comments/queries/get-comment-by-id.query-handler';
import { GetCommentListByPostIdQueryHandler } from './application/comments/queries/get-comment-list-by-post-id.query-handler';
import { CreatePostForBlogCommandHandler } from './application/posts/commands/create-post-for-blog.command-handler';
import { MarkPostAsDeletedByBlogIdAndPostIdCommandHandler } from './application/posts/commands/mark-post-as-deleted-by-blog-id-and-post-id.command-handler';
import { UpdatePostByBlogIdAndPostIdCommandHandler } from './application/posts/commands/update-post-by-blog-id-and-post-id.command-handler';
import { UpdatePostLikeStatusByIdCommandHandler } from './application/posts/commands/update-post-like-status-by-id.command-handler';
import { GetPostByIdQueryHandler } from './application/posts/queries/get-post-by-id.query-handler';
import { GetPostListQueryHandler } from './application/posts/queries/get-post-list.query-handler';
import { GetPostListByBlogIdQueryHandler } from './application/posts/queries/get-post-list-by-blog-id.query-handler';
import { Blog } from './domain/blogs/blog.entity';
import { Comment } from './domain/comments/comment.entity';
import { CommentLikeData } from './domain/comments/comment-like-data.entity';
import { Post } from './domain/posts/post.entity';
import { PostLikeData } from './domain/posts/post-like-data.entity';

/*Модуль для блогов, постов и комментариев.*/
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'access-jwt' }),
    UserModule,
    TypeOrmModule.forFeature([Blog, Post, PostLikeData, Comment, CommentLikeData]),
  ],
  controllers: [BlogsController, BlogsSaController, PostsController, CommentsController],
  providers: [
    CreateBlogCommandHandler,
    GetBlogByIdQueryHandler,
    GetBlogListQueryHandler,
    UpdateBlogByIdCommandHandler,
    MarkBlogAsDeletedByIdCommandHandler,
    CreatePostForBlogCommandHandler,
    GetPostByIdQueryHandler,
    GetPostListQueryHandler,
    GetPostListByBlogIdQueryHandler,
    UpdatePostByBlogIdAndPostIdCommandHandler,
    UpdatePostLikeStatusByIdCommandHandler,
    MarkPostAsDeletedByBlogIdAndPostIdCommandHandler,
    CreateCommentForPostCommandHandler,
    GetCommentByIdQueryHandler,
    GetCommentListByPostIdQueryHandler,
    UpdateCommentByIdCommandHandler,
    UpdateCommentLikeStatusByIdCommandHandler,
    MarkCommentAsDeletedByIdCommandHandler,
    BlogsRepository,
    PostsRepository,
    CommentsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
  ],
})
export class BlogModule {}
