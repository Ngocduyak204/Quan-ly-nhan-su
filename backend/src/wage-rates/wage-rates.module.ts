import { Module } from '@nestjs/common';
import { WageRatesController } from './wage-rates.controller';
import { WageRatesService } from './wage-rates.service';

@Module({
  controllers: [WageRatesController],
  providers: [WageRatesService],
  exports: [WageRatesService],
})
export class WageRatesModule {}
