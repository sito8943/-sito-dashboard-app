export type SoftDeleteScope = "ACTIVE" | "DELETED" | "ALL";

export interface BaseFilterDto {
  deletedAt?: Date | null;
  softDeleteScope?: SoftDeleteScope;
}
