import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../infrastructure/users/users.query-repository';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { UserListOutputDTO, UserOutputDTO } from '../../../api/users/output-dto/user.output-dto';
import { UserList } from '../../../domain/users/users.entity';
import { GetUserListQuery } from './get-user-list.query';

/*Обработчик запроса для поиска пользователей.*/
@QueryHandler(GetUserListQuery)
export class GetUserListQueryHandler implements IQueryHandler<GetUserListQuery> {
  public constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  public async execute({ dto }: GetUserListQuery): Promise<PaginationMetaDataOutputDTO<UserListOutputDTO>> {
    /*Просим query-репозиторий "UsersQueryRepository" найти пользователей в БД.*/
    const { items, totalCount }: { items: UserList; totalCount: number } = await this.usersQueryRepository.findAll(dto);
    /*Преобразовываем пользователей из БД в подготовленных для отправки клиенту пользователей.*/
    const userListOutput: UserListOutputDTO = UserOutputDTO.mapFromUserListToUserListOutputDTO(items);

    /*Преобразовываем подготовленных для отправки клиенту пользователей в подготовленных для отправки клиенту с
    пагинацией пользователей и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: totalCount,
      items: userListOutput,
    });
  }
}
