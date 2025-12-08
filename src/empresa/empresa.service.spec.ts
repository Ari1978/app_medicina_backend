import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';

describe('EmpresaService', () => {
  let service: EmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: 'EmpresaModel',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('Debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
