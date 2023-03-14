import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { GitlabReviewService } from './gitlab-review.service';

@Controller('gitlab-review')
export class GitlabReviewController {
  constructor(private readonly gitlabReviewService: GitlabReviewService) {}

  @Post('webhook')
  @HttpCode(200)
  async gitWebhook(
    @Body() body: any,
    @Query('projectId') projectId: string,
    @Query('token') token: string,
    @Query('language') language: string,
  ) {
    if (!projectId || !token || !language) {
      throw new BadRequestException('projectId or token or language missed');
    }
    if (body.object_kind === 'merge_request') {
      const { origin: host } = new URL(body.project.web_url);
      this.gitlabReviewService.startReview({
        projectId,
        token,
        language,
        host,
      });
    }
    return 'ok';
  }
}
