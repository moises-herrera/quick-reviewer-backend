import { PullRequestFiltersType } from '../schemas/pull-request-filters.schema';
import { UserBasicInfo } from './user-basic-info';

export type PullRequestAuthFilters = PullRequestFiltersType & UserBasicInfo;
