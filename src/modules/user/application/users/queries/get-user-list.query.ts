import { Query } from '@nestjs/cqrs';
import { GetUserListQueryInputDTO } from '../../../api/users/input-dto/query/get-user-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { UserListOutputDTO } from '../../../api/users/output-dto/user.output-dto';

/*Запрос для поиска пользователей.*/
export class GetUserListQuery extends Query<PaginationMetaDataOutputDTO<UserListOutputDTO>> {
  public constructor(public readonly dto: GetUserListQueryInputDTO) {
    super();
  }
}
