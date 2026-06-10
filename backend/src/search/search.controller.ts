import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('reindex')
  @Roles('ADMIN')
  async reindex() {
    const count = await this.searchService.reindexAll();
    return { reindexed: count };
  }

  @Get()
  async search(@Query('q') q: string, @Request() req) {
    return this.searchService.search(q, req.user);
  }
}
