import { IsString, IsOptional, IsBoolean, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for validating link creation
 */
export class CreateLinkDto {
  @IsMongoId()
  project!: string;

  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO for validating link updates
 */
export class UpdateLinkDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}