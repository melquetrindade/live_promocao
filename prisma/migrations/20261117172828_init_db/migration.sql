-- CreateEnum
CREATE TYPE "StatusFuncionario" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusLive" AS ENUM ('AGENDADA', 'ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'PAGO', 'DESPACHADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "empresa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "StatusFuncionario" NOT NULL DEFAULT 'ATIVO',
    "cargo" TEXT NOT NULL,
    "empresa_id" INTEGER NOT NULL,

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credencial" (
    "id" SERIAL NOT NULL,
    "funcionario_id" INTEGER NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "login" TEXT NOT NULL,

    CONSTRAINT "credencial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo_barras" TEXT NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "telefone" TEXT,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "StatusLive" NOT NULL DEFAULT 'AGENDADA',
    "data_abertura" TIMESTAMP(3) NOT NULL,
    "data_fechamento" TIMESTAMP(3),
    "meta_arrecadacao" DECIMAL(12,2),
    "empresa_id" INTEGER NOT NULL,

    CONSTRAINT "live_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_produto" (
    "id" SERIAL NOT NULL,
    "live_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "preco_live" DECIMAL(10,2) NOT NULL,
    "quantidade_disponivel" INTEGER NOT NULL,

    CONSTRAINT "live_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id" SERIAL NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "total" DECIMAL(12,2) NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "funcionario_despacho_id" INTEGER,
    "live_id" INTEGER NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_pedido" (
    "id" SERIAL NOT NULL,
    "live_produto_id" INTEGER NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "item_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anotacao_live" (
    "id" SERIAL NOT NULL,
    "anotacao" TEXT NOT NULL,
    "live_id" INTEGER NOT NULL,
    "funcionario_id" INTEGER NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anotacao_live_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_cnpj_key" ON "empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "credencial_funcionario_id_key" ON "credencial"("funcionario_id");

-- CreateIndex
CREATE UNIQUE INDEX "credencial_login_key" ON "credencial"("login");

-- CreateIndex
CREATE UNIQUE INDEX "produto_codigo_barras_key" ON "produto"("codigo_barras");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_instagram_key" ON "cliente"("instagram");

-- CreateIndex
CREATE UNIQUE INDEX "live_produto_live_id_produto_id_key" ON "live_produto"("live_id", "produto_id");

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "funcionario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credencial" ADD CONSTRAINT "credencial_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live" ADD CONSTRAINT "live_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_produto" ADD CONSTRAINT "live_produto_live_id_fkey" FOREIGN KEY ("live_id") REFERENCES "live"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_produto" ADD CONSTRAINT "live_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_funcionario_despacho_id_fkey" FOREIGN KEY ("funcionario_despacho_id") REFERENCES "funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_live_id_fkey" FOREIGN KEY ("live_id") REFERENCES "live"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_live_produto_id_fkey" FOREIGN KEY ("live_produto_id") REFERENCES "live_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anotacao_live" ADD CONSTRAINT "anotacao_live_live_id_fkey" FOREIGN KEY ("live_id") REFERENCES "live"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anotacao_live" ADD CONSTRAINT "anotacao_live_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
