import { PaginatedInputDTO, PaginatedResultDTO } from "__SHARED_PACKAGE_NAME__";
import { UserDTO } from "./user.dto";

export type FindAllUsersInDTO = PaginatedInputDTO;

export type FindAllUsersOutDTO = PaginatedResultDTO<UserDTO>;
