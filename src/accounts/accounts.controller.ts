import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountBodyInputDto } from './dto/create-account.input-dto';
import { CreateAccountOutputDto } from './dto/create-account.output-dto';
import { DeleteAccountParamsInputDto } from './dto/delete-account.input-dto';
import { ListAccountsOutputDto } from './dto/list-accounts.output-dto';
import {
  UpdateAccountBodyInputDto,
  UpdateAccountParamsInputDto,
} from './dto/update-account.input-dto';
import { UpdateAccountOutputDto } from './dto/update-account.output-dto';

@Controller('accounts')
@ApiBearerAuth('bearer')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: CreateAccountOutputDto })
  async create(
    @User() user: { userId: string },
    @Body() createAccountDto: CreateAccountBodyInputDto,
  ) {
    return this.accountsService.create(user.userId, createAccountDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ListAccountsOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.accountsService.findAll(user.userId);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateAccountOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateAccountParamsInputDto,
    @Body() updateAccountDto: UpdateAccountBodyInputDto,
  ) {
    return this.accountsService.update(
      user.userId,
      params.id,
      updateAccountDto,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateAccountOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteAccountParamsInputDto,
  ) {
    return this.accountsService.delete(user.userId, params.id);
  }
}
