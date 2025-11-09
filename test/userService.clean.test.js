const { UserService } = require('../src/userService');

const DADOS_PADRAO = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService Testes Limpos e Organizados', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  /* Essa é uma prática recomendada em arquivos de testes: separar por seções para a melhor organização e identificação melhoria na agilidade do desenvolvimento */

  // ---------------------------
  // CREATE USER
  // ---------------------------

  test('deve criar um usuário com dados válidos', () => {
    // Arrange
    const { nome, email, idade } = DADOS_PADRAO;

    // Act
    const usuarioCriado = userService.createUser(nome, email, idade);

    // Assert
    expect(usuarioCriado).toMatchObject({
      nome,
      email,
      idade,
      status: 'ativo',
      isAdmin: false,
    });
    expect(usuarioCriado.id).toBeDefined();
  });

  test('deve lançar erro ao criar usuário menor de idade', () => {
    // Arrange
    const menorDeIdade = { nome: 'Menor', email: 'menor@email.com', idade: 17 };

    // Act + Assert
    expect(() =>
      userService.createUser(menorDeIdade.nome, menorDeIdade.email, menorDeIdade.idade)
    ).toThrow('O usuário deve ser maior de idade.');
  });

  test('deve lançar erro ao criar usuário com campos obrigatórios ausentes', () => {
    // Act + Assert
    expect(() => userService.createUser(null, 'email@teste.com', 22))
      .toThrow('Nome, email e idade são obrigatórios.');

    expect(() => userService.createUser('Nome', null, 22))
      .toThrow('Nome, email e idade são obrigatórios.');

    expect(() => userService.createUser('Nome', 'email@teste.com', null))
      .toThrow('Nome, email e idade são obrigatórios.');
  });

  // ---------------------------
  // GET USER
  // ---------------------------

  test('deve retornar o usuário pelo ID após criação', () => {
    // Arrange
    const usuarioCriado = userService.createUser(DADOS_PADRAO.nome, DADOS_PADRAO.email, DADOS_PADRAO.idade);

    // Act
    const usuarioBuscado = userService.getUserById(usuarioCriado.id);

    // Assert
    expect(usuarioBuscado).toEqual(usuarioCriado);
  });

  test('deve retornar null se o usuário não existir', () => {
    // Act
    const resultado = userService.getUserById('id-invalido');

    // Assert
    expect(resultado).toBeNull();
  });

  // ---------------------------
  // DEACTIVATE USER
  // ---------------------------

  test('deve desativar um usuário comum com sucesso', () => {
    // Arrange
    const usuario = userService.createUser('Comum', 'comum@teste.com', 30);

    // Act
    const resultado = userService.deactivateUser(usuario.id);

    // Assert
    expect(resultado).toBe(true);
    const usuarioAtualizado = userService.getUserById(usuario.id);
    expect(usuarioAtualizado.status).toBe('inativo');
  });

  test('não deve desativar um usuário administrador', () => {
    // Arrange
    const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    // Act
    const resultado = userService.deactivateUser(admin.id);

    // Assert
    expect(resultado).toBe(false);
    const usuarioAtualizado = userService.getUserById(admin.id);
    expect(usuarioAtualizado.status).toBe('ativo');
  });

  test('não deve desativar um usuário inexistente', () => {
    // Act
    const resultado = userService.deactivateUser('id-inexistente');

    // Assert
    expect(resultado).toBe(false);
  });

  // ---------------------------
  // REPORT
  // ---------------------------

  test('deve gerar um relatório contendo o cabeçalho e os nomes dos usuários', () => {
    // Arrange
    const usuario1 = userService.createUser('Vinicius', 'vinicius@email.com', 28);
    const usuario2 = userService.createUser('Dias', 'dias@email.com', 32);

    // Act
    const relatorio = userService.generateUserReport();

    // Assert
    expect(relatorio).toContain('Relatório de Usuários');
    expect(relatorio).toContain(usuario1.nome);
    expect(relatorio).toContain(usuario2.nome);
  });

  test('deve indicar que não há usuários quando o banco está vazio', () => {
    // Arrange
    userService._clearDB();

    // Act
    const relatorio = userService.generateUserReport();

    // Assert
    expect(relatorio).toContain('Nenhum usuário cadastrado');
  });
});
