import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetPostListQueryInputDTO } from '../../api/posts/input-dto/query/get-post-list-query.input-dto';
import { PostSortFieldQueryInputDTO } from '../../api/posts/input-dto/query/post-sort-field-query.input-dto';
import {
  NewestPostLikeListOutputDTO,
  NewestPostLikeOutputDTO,
} from '../../api/posts/output-dto/newest-post-like.output-dto';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';
import { Post, PostList } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';

/*Query-репозиторий для постов.*/
@Injectable()
export class PostsQueryRepository {
  public constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLikeData) private readonly postLikesDataRepository: Repository<PostLikeData>
  ) {}

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({ where: { id }, relations: { blog: true } });
  }

  /*Метод для поиска постов в БД.*/
  public async findAll(
    dto: GetPostListQueryInputDTO,
    blogId?: string
  ): Promise<{ items: PostList; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций.*/
    const allowedSortFields: Record<string, keyof Post> = {
      title: 'title',
      shortDescription: 'shortDescription',
      content: 'content',
      blogId: 'blogId',
      createdAt: 'createdAt',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof Post = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Динамически собираем условие для клаузы "WHERE": если был передан параметр "blogId", то фильтруем по нему, иначе
    условие для клаузы "WHERE" остается пустым объектом и TypeORM вернет все записи с проверкой на soft удаление.*/
    const where: FindOptionsWhere<Post> = {};
    if (blogId) where.blogId = blogId;

    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [PostList, number] = await this.postsRepository.findAndCount({
      where,
      relations: { blog: true },
      order:
        dto.sortBy === PostSortFieldQueryInputDTO.BlogName
          ? { blog: { name: sortDirection }, id: 'ASC' }
          : { [sortField]: sortDirection, id: 'ASC' },
      skip,
      take: dto.pageSize,
    });

    /*Возвращаем данные по постам.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<PostLikeData | null> {
    return this.postLikesDataRepository.findOneBy({ postId, userId });
  }

  /*Метод для поиска данных о лайках постов по ID постов и ID пользователя в БД.*/
  public async findAllPostLikesDataByPostIdsAndUserId(postIds: string[], userId: string): Promise<PostLikeData[]> {
    return this.postLikesDataRepository.find({ where: { postId: In(postIds), userId } });
  }

  /*Метод для поиска данных о трех последних лайках поста по ID поста в БД.*/
  public async findLastThreePostLikesByPostId(postId: string): Promise<NewestPostLikeListOutputDTO> {
    const likes: PostLikeData[] = await this.postLikesDataRepository.find({
      where: { postId, likeStatus: PostLikeStatusDomainDTO.Like },
      relations: { user: true },
      order: { addedAt: 'DESC' },
      take: 3,
    });

    /*Возвращаем данные о трех последних лайках поста.*/
    return likes.map((like: PostLikeData): NewestPostLikeOutputDTO => ({
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.user.login,
    }));
  }

  /*Метод для поиска данных о трех последних лайках постов по ID постов в БД.*/
  public async findLastThreeLikesForPostsByPostIds(
    postIds: string[]
  ): Promise<Map<string, NewestPostLikeListOutputDTO>> {
    /*Если массив ID постов пустой, то возвращаем пустой Map.*/
    if (postIds.length === 0) return new Map();

    /*Создаем подзапрос: соединяем данные о лайках постов с пользователями и нумеруем данные о лайках постов внутри
    каждого поста от 1 до N по убыванию даты добавления. Оконная функция "ROW_NUMBER()" сбрасывает счетчик на 1 при
    смене ID поста.*/
    const subQueryBuilder: SelectQueryBuilder<PostLikeData> = this.postLikesDataRepository
      .createQueryBuilder('postLikeData')
      .select('postLikeData.postId', 'postId')
      .addSelect('postLikeData.addedAt', 'addedAt')
      .addSelect('postLikeData.userId', 'userId')
      .addSelect('u.login', 'login')
      .addSelect('ROW_NUMBER() OVER (PARTITION BY postLikeData.postId ORDER BY postLikeData.addedAt DESC)', 'rn')
      .innerJoin('postLikeData.user', 'u')
      .where('postLikeData.postId IN (:...postIds)', { postIds })
      .andWhere('postLikeData.likeStatus = :status', { status: PostLikeStatusDomainDTO.Like });

    /*Создаем внешний запрос: оборачиваем подзапрос выше в клаузу "FROM" и фильтруем строки с номером меньше или равным
    3. Метод "getQuery()" возвращает SQL-строку подзапроса, а метод "getParameters()" - его параметры, которые
    объединяются с параметрами внешнего запроса.

    Вызов "this.postLikesDataRepository.createQueryBuilder()" выше заставил TypeORM автоматически привязать экземпляр
    класса "QueryBuilder" к сущности "PostLikeData", тем самым автоматически добавил таблицу этой сущности в клаузу
    "FROM". Это было необходимо в подзапросе выше, так как данные читались напрямую из таблицы "post_likes_data". Здесь
    же мы работаем с результатом этого подзапроса, а не с сущностью "PostLikeData" напрямую, поэтому вызываем
    "this.postLikesDataRepository.manager.createQueryBuilder()", так как класс "EntityManager" автоматически не
    привязывается ни к какой конкретной сущности и TypeORM автоматически не будет привязывать экземпляр класса
    "QueryBuilder" к сущности "PostLikeData", тем самым не будет автоматически добавляться таблица этой сущности в
    клаузу "FROM".

    Поскольку здесь алиас "subQuery" не привязан к сущности TypeORM, так как был зарегистрирован через метод "from()",
    а не через репозиторий или join-метод, то в методе "where()" TypeORM не сможет автоматически обернуть его в двойные
    кавычки, поэтому указываем их вручную.*/
    const rawPostLikesData: { postId: string; addedAt: Date; userId: string; login: string }[] =
      await this.postLikesDataRepository.manager
        .createQueryBuilder()
        .from(`(${subQueryBuilder.getQuery()})`, 'subQuery')
        .setParameters(subQueryBuilder.getParameters())
        .where('"subQuery".rn <= :maxRn', { maxRn: 3 })
        .getRawMany<{ postId: string; addedAt: Date; userId: string; login: string }>();

    /*Создаем Map формата "postId: NewestPostLikeListOutputDTO" для группировки результата.*/
    const map: Map<string, NewestPostLikeListOutputDTO> = new Map();

    /*Перебираем каждые данные о лайках поста и заполняем созданный Map.*/
    for (const rawPostLikeData of rawPostLikesData) {
      if (!map.has(rawPostLikeData.postId)) map.set(rawPostLikeData.postId, []);

      map
        .get(rawPostLikeData.postId)!
        .push({ addedAt: rawPostLikeData.addedAt, userId: rawPostLikeData.userId, login: rawPostLikeData.login });
    }

    /*Возвращаем данные о трех последних лайках постов.*/
    return map;
  }
}
