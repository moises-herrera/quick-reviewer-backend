import { PullRequestFiltersWithStateType } from '../schemas/pull-request-filters-with-state.schema';
import { UserBasicInfo } from './user-basic-info';

export type PullRequestAuthFiltersWithState = PullRequestFiltersWithStateType &
  UserBasicInfo;
