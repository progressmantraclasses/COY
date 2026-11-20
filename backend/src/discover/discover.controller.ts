import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { SwipeDto } from './dto/swipe.dto';
import { MatchView, PublicProfile, SwipeResult } from './profile.types';

@Controller()
export class DiscoverController {
  constructor(private readonly discover: DiscoverService) {}

  /** GET /feed: profiles the user has not swiped on yet. */
  @Get('feed')
  async feed(): Promise<{ profiles: PublicProfile[] }> {
    return { profiles: await this.discover.getFeed() };
  }

  /** POST /swipe: records a like/pass and reports whether it created a match. */
  @Post('swipe')
  @HttpCode(200)
  swipe(@Body() dto: SwipeDto): Promise<SwipeResult> {
    return this.discover.swipe(dto.profileId, dto.action);
  }

  /** GET /matches: the user's mutual matches. */
  @Get('matches')
  async matches(): Promise<{ matches: MatchView[] }> {
    return { matches: await this.discover.getMatches() };
  }

  /** POST /reset: demo convenience, wipes all swipes and matches. */
  @Post('reset')
  @HttpCode(200)
  async reset(): Promise<{ ok: true }> {
    await this.discover.reset();
    return { ok: true };
  }
}
