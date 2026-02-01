import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface ProductSearchResult {
  productCode: string;
  productName: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  finalSize: string;
}

interface ProductDetail {
  productCode: string;
  productName: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  finalSize: string;
  clayType: string;
  clayQuantity: number;
  glaze: string | null;
  engobe: string | null;
  luster: string | null;
  stainsOxides: string | null;
  castingTools: string | null;
  extruders: string | null;
  textures: string | null;
  generalTools: string | null;
  buildNotes: string;
}

export class ProductService {
  /**
   * Search products from gayafusionall
   */
  async searchProducts(query: string, limit: number = 50) {
    // TODO: Implement actual search from gayafusionall database
    // For now, return mock data
    
    const products: ProductSearchResult[] = [
      {
        productCode: 'TP-MAIN',
        productName: 'Teapot (Main Body)',
        color: 'Blue',
        texture: 'Smooth',
        material: 'Stoneware',
        size: '500ml',
        finalSize: '500ml',
      },
      {
        productCode: 'TP-LID',
        productName: 'Teapot (Lid)',
        color: 'Blue',
        texture: 'Smooth',
        material: 'Stoneware',
        size: '500ml',
        finalSize: '500ml',
      },
      {
        productCode: 'CP-MAIN',
        productName: 'Cup (Main Body)',
        color: 'White',
        texture: 'Smooth',
        material: 'Porcelain',
        size: '250ml',
        finalSize: '250ml',
      },
      {
        productCode: 'CP-HANDLE',
        productName: 'Cup (Handle)',
        color: 'White',
        texture: 'Smooth',
        material: 'Porcelain',
        size: '250ml',
        finalSize: '250ml',
      },
      {
        productCode: 'PL-MAIN',
        productName: 'Plate (Main)',
        color: 'Green',
        texture: 'Textured',
        material: 'Stoneware',
        size: '10 inch',
        finalSize: '10 inch',
      },
    ];

    // Filter by query if provided
    const filteredProducts = query
      ? products.filter(
          (p) =>
            p.productCode.toLowerCase().includes(query.toLowerCase()) ||
            p.productName.toLowerCase().includes(query.toLowerCase())
        )
      : products;

    return {
      products: filteredProducts.slice(0, limit),
      total: filteredProducts.length,
    };
  }

  /**
   * Get product by code
   */
  async getProductByCode(code: string) {
    // TODO: Implement actual retrieval from gayafusionall database
    // For now, return mock data
    
    const product: ProductDetail = {
      productCode: code,
      productName: 'Teapot (Main Body)',
      color: 'Blue',
      texture: 'Smooth',
      material: 'Stoneware',
      size: '500ml',
      finalSize: '500ml',
      clayType: 'Stoneware',
      clayQuantity: 2.5,
      glaze: 'Blue Glaze',
      engobe: null,
      luster: null,
      stainsOxides: null,
      castingTools: 'Teapot Mold (500ml)',
      extruders: null,
      textures: null,
      generalTools: 'Sponge, Rib, Wire cutter',
      buildNotes: 'Form by throwing, handle separately. Allow to dry slowly to prevent cracking. Bisque fire to Cone 04, glaze fire to Cone 6.',
    };

    return product;
  }

  /**
   * Get material requirements for a product
   */
  async getMaterialRequirements(code: string) {
    // TODO: Implement actual retrieval from gayafusionall database
    // For now, return mock data
    
    const materials = {
      clay: [
        { type: 'Stoneware', quantity: 2.5 },
      ],
      glazes: ['Blue Glaze'],
      engobes: [],
      lusters: [],
      stainsOxides: [],
    };

    return {
      productCode: code,
      materials,
    };
  }

  /**
   * Get tool requirements for a product
   */
  async getToolRequirements(code: string) {
    // TODO: Implement actual retrieval from gayafusionall database
    // For now, return mock data
    
    const tools = {
      castingTools: ['Teapot Mold (500ml)'],
      extruders: [],
      textures: [],
      generalTools: ['Sponge', 'Rib', 'Wire cutter'],
    };

    return {
      productCode: code,
      tools,
    };
  }

  /**
   * Get build notes for a product
   */
  async getBuildNotes(code: string) {
    // TODO: Implement actual retrieval from gayafusionall database
    // For now, return mock data
    
    const buildNotes = 'Form by throwing, handle separately. Allow to dry slowly to prevent cracking. Bisque fire to Cone 04, glaze fire to Cone 6.';

    return {
      productCode: code,
      buildNotes,
    };
  }

  /**
   * Get all product codes
   */
  async getAllProductCodes() {
    // TODO: Implement actual retrieval from gayafusionall database
    // For now, return mock data
    
    const productCodes = [
      'TP-MAIN',
      'TP-LID',
      'CP-MAIN',
      'CP-HANDLE',
      'PL-MAIN',
      'PL-SMALL',
      'BOWL-MAIN',
      'BOWL-SMALL',
      'MUG-MAIN',
      'MUG-HANDLE',
    ];

    return {
      productCodes,
      total: productCodes.length,
    };
  }

  /**
   * Get product by name
   */
  async getProductByName(name: string) {
    // TODO: Implement actual retrieval from gayafusionall database
    // For now, return mock data
    
    const product: ProductDetail = {
      productCode: 'TP-MAIN',
      productName: name,
      color: 'Blue',
      texture: 'Smooth',
      material: 'Stoneware',
      size: '500ml',
      finalSize: '500ml',
      clayType: 'Stoneware',
      clayQuantity: 2.5,
      glaze: 'Blue Glaze',
      engobe: null,
      luster: null,
      stainsOxides: null,
      castingTools: 'Teapot Mold (500ml)',
      extruders: null,
      textures: null,
      generalTools: 'Sponge, Rib, Wire cutter',
      buildNotes: 'Form by throwing, handle separately. Allow to dry slowly to prevent cracking. Bisque fire to Cone 04, glaze fire to Cone 6.',
    };

    return product;
  }
}

export const productService = new ProductService();
