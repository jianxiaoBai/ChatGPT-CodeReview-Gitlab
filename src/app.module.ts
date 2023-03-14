import { Module } from '@nestjs/common';
import { GitlabReviewController } from './gitlab-review.controller';
import { GitlabReviewService } from './gitlab-review.service';
@Module({
  imports: [],
  controllers: [GitlabReviewController],
  providers: [GitlabReviewService],
})
export class AppModule {}
