import { CreateProductRepository, type Transaction } from "../repositories/create-product.repository";

const createProductRepository = new CreateProductRepository();

export class InitializeInventoryService {
  async initializeForNewProduct(tx: Transaction, payload: { productId: string; actorUserId: string }) {
    await createProductRepository.createInventoryRowTx(tx, payload);
    await createProductRepository.createInventoryInitializationLogTx(tx, payload);
  }
}

export const initializeInventoryService = new InitializeInventoryService();
