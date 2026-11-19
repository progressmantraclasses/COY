import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SwipeAction } from '../profile.types';

export class SwipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  profileId: string;

  @IsIn(['like', 'pass'])
  action: SwipeAction;
}
