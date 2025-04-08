import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import {
  PullRequestFiltersSchema,
  PullRequestFiltersType,
} from 'src/common/schemas/pull-request-filters.schema';
import { z } from 'zod';

describe('ValidateDataMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateBody', () => {
    it('should call next if the body is valid', () => {
      const mockSchema = {
        parse: vi.fn().mockReturnValue({
          repositories: ['repo1', 'repo2'],
          startDate: new Date(),
          endDate: new Date(),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as z.ZodObject<any, any>;
      const handler = validateBody(mockSchema);
      const spyNext = vi.fn();
      const body: PullRequestFiltersType = {
        repositories: ['repo1', 'repo2'],
        startDate: new Date(),
        endDate: new Date(),
      };
      const req = {
        body,
      } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      handler(req, res, spyNext);

      expect(req.body).toEqual(body);
      expect(spyNext).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the body is invalid', () => {
      const handler = validateBody(PullRequestFiltersSchema);
      const req = {
        body: {},
      } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      handler(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid data',
        details: [
          {
            message: 'repositories is Required',
          },
        ],
      });
    });

    it('should return 500 if an unexpected error occurs', () => {
      const handler = validateBody(PullRequestFiltersSchema);
      const req = {
        body: {},
      } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      vi.spyOn(PullRequestFiltersSchema, 'parse').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      handler(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
      });
    });
  });
});
