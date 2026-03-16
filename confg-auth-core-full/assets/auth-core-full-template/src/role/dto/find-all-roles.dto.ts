import { PaginatedInputDTO, PaginatedResultDTO } from "__SHARED_PACKAGE_NAME__";
import { RoleDTO } from "./role.dto";

export type FindAllRolesInDTO = PaginatedInputDTO & { all?: boolean };

export type FindAllRolesOutDTO = PaginatedResultDTO<RoleDTO>;
