import { Command } from '@nestjs/cqrs';
import { UserRefreshJwtAuthContextDTO } from '../../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';
import { UserAgentAndIpDTO } from '../../../api/auth/decorators/param-extraction/dto/user-agent-and-ip.dto';
import { UserTokensDataDTO } from './dto/user-tokens-data.dto';

/*Команда для создания новых AT и RT.*/
export class CreateNewAccessAndRefreshTokensCommand extends Command<UserTokensDataDTO> {
  public constructor(
    public readonly userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO,
    public readonly ipAndUserAgent: UserAgentAndIpDTO
  ) {
    super();
  }
}
