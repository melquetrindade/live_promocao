ALTER TABLE "produto"
ADD COLUMN "empresa_id" INTEGER;

ALTER TABLE "produto"
ADD CONSTRAINT "produto_empresa_id_fkey"
FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
