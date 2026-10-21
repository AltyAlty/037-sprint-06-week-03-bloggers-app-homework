import { Command } from '@nestjs/cqrs';
import { UserLocalAuthContextDTO } from '../../../../../core/guards/local-auth/dto/user-local-auth-context.dto';
import { UserAgentAndIpDTO } from '../../../api/auth/decorators/param-extraction/dto/user-agent-and-ip.dto';
import { UserTokensDataDTO } from './dto/user-tokens-data.dto';

/*Команда для аутентификации пользователя.*/
export class AuthUserCommand extends Command<UserTokensDataDTO> {
  public constructor(
    public readonly userLocalAuthContext: UserLocalAuthContextDTO,
    public readonly ipAndUserAgent: UserAgentAndIpDTO
  ) {
    super();
  }
}
