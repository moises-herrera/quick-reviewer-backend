import { CodeReview } from '@prisma/client';
import { CodeReviewData } from 'src/github/interfaces/code-review-data';
import { CodeReviewMapper } from 'src/github/mappers/code-review.mapper';

describe('CodeReviewMapper', () => {
  it('should map GitHub code review to internal code review', () => {
    const data: CodeReviewData = {
      id: 123,
      body: 'This is a test code review',
      state: 'commented',
      commit_id: 'commit-sha',
      submitted_at: '2023-01-01T00:00:00Z',
      user: { login: 'test-user', type: 'User' },
    };

    const expectedResult = {
      id: '123',
      reviewer: 'test-user',
      body: 'This is a test code review',
      status: 'COMMENTED',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      userType: 'User',
      commitId: 'commit-sha',
    } as CodeReview;

    const mappedCodeReview = CodeReviewMapper.mapCodeReviewToCreation(data);

    expect(mappedCodeReview).toEqual(expectedResult);
  });
});
