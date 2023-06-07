import { User } from './User';
import { Group } from './Group';

export type UserGroup = {
  id: string;
  userId: User['id'];
  groupId: Group['id'];
};
