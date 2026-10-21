import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для создания новой пары AT и RT.*/
export class CreateNewAccessAndRefreshTokensOutputDTO {
  @ApiProperty({ description: 'User Access JWT' })
  public accessToken: string;
}
