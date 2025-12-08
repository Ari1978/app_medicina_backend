
import { SetMetadata } from '@nestjs/common';

export const STAFF_PERMISO_KEY = 'staff_permiso';

export const StaffPermiso = (permiso: string) =>
  SetMetadata(STAFF_PERMISO_KEY, permiso);



