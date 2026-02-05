import { DeleteDto } from "lib";

export interface BaseEntityDto extends DeleteDto {
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
