import { Controller, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Post('reindex')
  @Roles('ADMIN')
  async reindex() {
    const count = await this.search.reindexAll();
    return { reindexed: count };
  }
}
